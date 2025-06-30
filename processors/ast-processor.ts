import { createPxToRemConverter } from "../utils"
import { processTemplateQuasis } from "./css-processor"
import type {
	Expression,
	Node,
	ProcessOptions,
	TaggedTemplateExpression,
	TemplateLiteral,
} from "../types"

/**
 * Check if a node is a target template expression
 */
export function isTargetTemplateExpression(
	node: Node,
	targetFunctions: string[],
): node is TaggedTemplateExpression {
	if (node.type !== "TaggedTemplateExpression") return false

	const {tag} = node

	// Handle direct function calls like: css`...`
	if (tag.type === "Identifier") {
		return targetFunctions.includes(tag.name)
	}

	// Handle member expressions like: styled.css`...` or theme.css`...`
	if (tag.type === "MemberExpression" && tag.property.type === "Identifier") {
		return targetFunctions.includes(tag.property.name)
	}

	return false
}

/**
 * Process template expressions to convert px values to rem in string literals
 */
export function processTemplateExpressions(
	template: TemplateLiteral,
	options: ProcessOptions,
): boolean {
	let hasChanges = false

	const pxtorem = createPxToRemConverter({
		rootValue: options.rootValue,
		unitPrecision: options.unitPrecision,
		minPixelValue: options.minPixelValue,
	})

	const processExpression = (expr: Expression): boolean => {
		let changed = false

		if (expr.type === "StringLiteral") {
			const originalValue = expr.value
			const pxRegex = /(-?\d*\.?\d+)px/g
			const newValue = originalValue.replaceAll(pxRegex, (match, numStr) => {
				const pxValue = Number.parseFloat(numStr)
				if (isNaN(pxValue) || Math.abs(pxValue) < options.minPixelValue) {
					return match
				}
				return pxtorem(pxValue)
			})
			if (newValue !== originalValue) {
				expr.value = newValue
				changed = true
			}
		} else if (expr.type === "ConditionalExpression") {
			// Handle conditional expressions like: open ? "340px" : 0
			if (processExpression(expr.consequent)) changed = true
			if (processExpression(expr.alternate)) changed = true
		}

		return changed
	}

	// Process expressions in template literals (${...} parts)
	for (const expression of template.expressions) {
		// Only process actual expressions, not TypeScript types
		if (expression && typeof expression === "object" && expression.type) {
			if (processExpression(expression as Expression)) {
				hasChanges = true
			}
		}
	}

	return hasChanges
}

/**
 * Process complete template literals (both static and dynamic parts)
 */
export function processCompleteTemplate(
	template: TemplateLiteral,
	options: ProcessOptions,
): boolean {
	let hasChanges = false

	// Process static CSS parts
	if (processTemplateQuasis(template, options)) {
		hasChanges = true
	}

	// Process dynamic expressions
	if (processTemplateExpressions(template, options)) {
		hasChanges = true
	}

	return hasChanges
}
