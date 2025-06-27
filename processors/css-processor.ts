import type { TemplateLiteral, ProcessOptions } from "../types"
import { shouldConvertProperty, createPxToRemConverter } from "../utils"

/**
 * Convert px values to rem in CSS template strings
 * Uses regex matching to handle template expressions gracefully
 */
export function processCssTemplate(cssContent: string, options: ProcessOptions): string {
	try {
		if (!cssContent || typeof cssContent !== "string" || cssContent.trim() === "") {
			return cssContent
		}

		const { rootValue, unitPrecision, minPixelValue, propList } = options
		let hasChanges = false

		const pxToRem = createPxToRemConverter({
			rootValue,
			unitPrecision,
			minPixelValue,
		})

		const pxRegex = /(-?\d*\.?\d+)px/g
		const lines = cssContent.split("\n")
		let inBlockComment = false

		const processedLines = lines.map((line, index) => {
			const trimmedLine = line.trim()

			if (inBlockComment) {
				if (trimmedLine.includes("*/")) {
					inBlockComment = false
				}
				return line
			}

			if (trimmedLine.startsWith("/*")) {
				if (!trimmedLine.includes("*/")) {
					inBlockComment = true
				}
				return line
			}

			if (trimmedLine.startsWith("//")) {
				return line
			}

			// Check if current line has ignore comment (support both old and new plugin names)
			const currentLineHasIgnore = line.includes("antd-style-px-to-rem ignore") || line.includes("antd-style-px-to-rem ignore")

			// Check if previous line was a standalone ignore comment
			const previousLineIsIgnoreComment =
				index > 0 &&
				lines[index - 1] &&
				(lines[index - 1]!.trim().includes("antd-style-px-to-rem ignore") || lines[index - 1]!.trim().includes("antd-style-px-to-rem ignore")) &&
				!lines[index - 1]!.includes(":") // Previous line should be comment only, not a property

			// Skip processing if affected by previous line ignore comment
			if (previousLineIsIgnoreComment) {
				return line
			}

			const propertyMatch = line.match(/^(\s*)(-{0,2}[a-zA-Z_][a-zA-Z0-9_-]*)(\s*:\s*)(.*)$/)
			if (propertyMatch) {
				const indentation = propertyMatch[1] || ""
				const propName = propertyMatch[2] || ""
				const colonPart = propertyMatch[3] || ""
				let value = propertyMatch[4] || ""

				// Don't convert if current line has ignore comment
				if (shouldConvertProperty(propName, propList) && !currentLineHasIgnore) {
					const processedValue = value.replace(pxRegex, (match, numStr) => {
						const convertedValue = pxToRem(numStr)
						if (convertedValue !== match) {
							hasChanges = true
						}
						return convertedValue
					})
					value = processedValue
				}
				return `${indentation}${propName}${colonPart}${value}`
			} else if (propList.includes("*") && !propList.some((p) => p.startsWith("!"))) {
				// Only use fallback wildcard conversion if there are no exclusions and no ignore comment
				if (!currentLineHasIgnore) {
					const processedLine = line.replace(pxRegex, (match, numStr) => {
						const convertedValue = pxToRem(numStr)
						if (convertedValue !== match) {
							hasChanges = true
						}
						return convertedValue
					})
					return processedLine
				}
			}

			return line
		})

		const processedContent = processedLines.join("\n")
		return hasChanges ? processedContent : cssContent
	} catch (error) {
		console.warn("Failed to process CSS template with px to rem conversion:", error)
		return cssContent
	}
}

/**
 * Process template quasis (static parts of template literals)
 */
export function processTemplateQuasis(template: TemplateLiteral, options: ProcessOptions): boolean {
	let hasChanges = false

	// Process static CSS parts
	for (const quasi of template.quasis) {
		if (quasi.value && quasi.value.raw) {
			const originalCss = quasi.value.raw
			const processedCss = processCssTemplate(originalCss, options)

			if (processedCss !== originalCss) {
				quasi.value.raw = processedCss
				quasi.value.cooked = processedCss
				hasChanges = true
			}
		}
	}

	return hasChanges
}
