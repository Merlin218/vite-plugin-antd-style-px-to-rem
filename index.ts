import type { Plugin } from "vite"
import { parse } from "@babel/parser"
import traverse from "@babel/traverse"
import type { NodePath } from "@babel/traverse"
import generate from "@babel/generator"

// Fix for @babel/traverse default export issue with better error handling
const babelTraverse = (() => {
	if (typeof traverse === "function") return traverse
	// @ts-expect-error - Handle default export compatibility
	if (traverse && typeof traverse.default === "function") return traverse.default
	throw new Error("@babel/traverse import failed")
})()

// Fix for @babel/generator default export issue with better error handling
const babelGenerate = (() => {
	if (typeof generate === "function") return generate
	// @ts-expect-error - Handle default export compatibility
	if (generate && typeof generate.default === "function") return generate.default
	throw new Error("@babel/generator import failed")
})()

// Import types and utilities from separate modules
import type {
	AntdStylePxToRemOptions,
	TaggedTemplateExpression,
	CallExpression,
	ObjectProperty,
	JSXElement,
	StringLiteral,
} from "./types"
import { defaultOptions } from "./constants"
import {
	shouldProcess,
	shouldConvertProperty,
	isLengthProperty,
	createPxToRemConverter,
} from "./utils"
// CSS processing is now handled via ast-processor
import {
	processStyleObjectExpression,
	processConditionalExpression,
} from "./processors/jsx-processor"
import { isTargetTemplateExpression, processCompleteTemplate } from "./processors/ast-processor"

// Re-export types and main function
export type { AntdStylePxToRemOptions } from "./types"
export { defaultOptions } from "./constants"

export function antdStylePxToRem(options: AntdStylePxToRemOptions = {}): Plugin {
	const mergedOptions = {
		...defaultOptions,
		...options,
	}

	return {
		name: "antd-style-px-to-rem",
		enforce: "pre", // Run before other plugins to process JSX before React transforms it
		transform(code: string, id: string) {
			// Skip if file should not be processed
			if (!shouldProcess(id, mergedOptions.include, mergedOptions.exclude)) {
				return null
			}

			// Skip if code doesn't contain target functions, createStyles, or JSX attributes (when enabled)
			const hasTargetFunctions = mergedOptions.cssTemplateFunctions.some((fn) => {
				const patterns = [
					fn + "`", // css`...`
					"." + fn + "`", // styled.css`...`
					" " + fn + "`", // { css }`...`
					"(" + fn + "`", // (css)`...`
					"{" + fn + "`", // {css}`...`
				]
				return patterns.some((pattern) => code.includes(pattern))
			})
			const hasCreateStyles = code.includes("createStyles")
			const hasJSXAttributes =
				mergedOptions.enableJSXTransform &&
				(code.includes("style=") || code.includes("gap="))

			if (!hasTargetFunctions && !hasCreateStyles && !hasJSXAttributes) {
				return null
			}

			try {
				// Parse the code into AST
				const ast = parse(code, {
					sourceType: "module",
					plugins: [
						"typescript",
						"jsx",
						"decorators-legacy",
						"classProperties",
						"objectRestSpread",
					],
				})

				let hasChanges = false

				// Split code into lines for checking ignore comments
				const codeLines = code.split("\n")

				const processOptions = {
					rootValue: mergedOptions.rootValue,
					unitPrecision: mergedOptions.unitPrecision,
					minPixelValue: mergedOptions.minPixelValue,
					propList: mergedOptions.propList,
					replace: mergedOptions.replace,
					mediaQuery: mergedOptions.mediaQuery,
				}

				const pxToRem = createPxToRemConverter({
					rootValue: processOptions.rootValue,
					unitPrecision: processOptions.unitPrecision,
					minPixelValue: processOptions.minPixelValue,
				})

				// Traverse AST to find and process CSS template literals
				babelTraverse(ast, {
					TaggedTemplateExpression(path: NodePath<TaggedTemplateExpression>) {
						const node = path.node

						if (isTargetTemplateExpression(node, mergedOptions.cssTemplateFunctions)) {
							const templateChanged = processCompleteTemplate(
								node.quasi,
								processOptions,
							)
							if (templateChanged) {
								hasChanges = true
							}
						}
					},
					CallExpression(path: NodePath<CallExpression>) {
						const node = path.node
						const callee = node.callee

						// Check for createStyles() call
						if (callee.type !== "Identifier" || callee.name !== "createStyles") {
							return
						}

						path.traverse({
							ObjectProperty(propPath: NodePath<ObjectProperty>) {
								const valueNode = propPath.node.value
								const keyNode = propPath.node.key

								let propName = ""
								if (keyNode.type === "Identifier") {
									propName = keyNode.name
								} else if (keyNode.type === "StringLiteral") {
									propName = keyNode.value
								}

								if (!propName) return

								const shouldConvert = shouldConvertProperty(
									propName,
									processOptions.propList,
								)

								if (valueNode.type === "StringLiteral") {
									if (!shouldConvert) return
									const originalValue = valueNode.value
									const pxRegex = /(-?\d*\.?\d+)px/g
									if (pxRegex.test(originalValue)) {
										const newValue = originalValue.replace(
											pxRegex,
											(_, numStr) => pxToRem(numStr),
										)
										if (newValue !== originalValue) {
											propPath.get("value").replaceWith({
												type: "StringLiteral",
												value: newValue,
											})
											hasChanges = true
										}
									}
								} else if (valueNode.type === "NumericLiteral") {
									if (!shouldConvert) return
									if (isLengthProperty(propName)) {
										const newValue = pxToRem(valueNode.value)
										propPath
											.get("value")
											.replaceWith({ type: "StringLiteral", value: newValue })
										hasChanges = true
									}
								} else if (valueNode.type === "TemplateLiteral") {
									if (processCompleteTemplate(valueNode, processOptions)) {
										hasChanges = true
									}
								}
							},
						})
					},
					JSXElement(path: NodePath<JSXElement>) {
						const node = path.node
						const openingElement = node.openingElement

						// Check for ignore comment using line-based approach
						const nodeStart = node.loc?.start.line
						let hasIgnoreComment = false

						if (
							nodeStart &&
							nodeStart > 0 &&
							nodeStart <= codeLines.length &&
							codeLines.length > 0
						) {
							// Check current line and previous line for ignore comment
							const currentLine = codeLines[nodeStart - 1] || ""
							const previousLine = nodeStart > 1 ? codeLines[nodeStart - 2] || "" : ""

							hasIgnoreComment =
								currentLine.includes("antd-style-px-to-rem ignore") ||
								currentLine.includes("antd-style-px-to-rem ignore") ||
								previousLine.includes("antd-style-px-to-rem ignore") ||
								previousLine.includes("antd-style-px-to-rem ignore")
						}

						if (hasIgnoreComment) {
							return
						}

						// Process JSX element attributes (only if JSX transform is enabled)
						if (
							mergedOptions.enableJSXTransform &&
							openingElement.name.type === "JSXIdentifier"
						) {
							const componentName = openingElement.name.name

							// Process attributes
							for (const attr of openingElement.attributes) {
								if (
									attr.type === "JSXAttribute" &&
									attr.name.type === "JSXIdentifier"
								) {
									const attrName = attr.name.name

									// Handle style attribute - process on all elements
									if (
										attrName === "style" &&
										attr.value?.type === "JSXExpressionContainer"
									) {
										// Handle object expressions in style attribute
										if (attr.value.expression.type === "ObjectExpression") {
											if (
												processStyleObjectExpression(
													attr.value.expression,
													processOptions,
												)
											) {
												hasChanges = true
											}
										}
										// Handle conditional expressions in style attribute
										else if (
											attr.value.expression.type === "ConditionalExpression"
										) {
											if (
												processConditionalExpression(
													attr.value.expression,
													processOptions,
												)
											) {
												hasChanges = true
											}
										}
									}
									// Handle gap attribute on Flex components
									else if (attrName === "gap" && componentName === "Flex") {
										// Check if the attribute value is a numeric literal
										if (
											attr.value?.type === "JSXExpressionContainer" &&
											attr.value.expression.type === "NumericLiteral"
										) {
											const numValue = attr.value.expression.value

											// Convert numeric value to rem string
											if (
												typeof numValue === "number" &&
												!isNaN(numValue) &&
												Math.abs(numValue) > processOptions.minPixelValue
											) {
												const remValue = pxToRem(numValue)

												// Replace numeric literal with string literal
												attr.value.expression = {
													type: "StringLiteral",
													value: remValue,
												} as StringLiteral

												hasChanges = true
											}
										}
									}
								}
							}
						}
					},
				})

				// Return transformed code if changes were made
				if (hasChanges) {
					const output = babelGenerate(ast, {
						retainLines: true,
						compact: false,
					})

					return {
						code: output.code,
						map: output.map,
					}
				}

				return null
			} catch (error) {
				console.error(`Failed to process file ${id}:`, error)
				return null
			}
		},
	}
}
