import type {
	ObjectExpression,
	StringLiteral,
	ProcessOptions,
	ConditionalExpression,
} from "../types"
import {
	shouldConvertProperty,
	hasVariableExpressions,
	isLengthProperty,
	createPxToRemConverter,
} from "../utils"
import { processTemplateQuasis } from "./css-processor"

/**
 * Process JSX style object expressions to convert px values to rem
 */
export function processStyleObjectExpression(
	objectExpression: ObjectExpression,
	options: ProcessOptions,
): boolean {
	let hasChanges = false

	const pxtorem = createPxToRemConverter({
		rootValue: options.rootValue,
		unitPrecision: options.unitPrecision,
		minPixelValue: options.minPixelValue,
	})

	for (const property of objectExpression.properties) {
		if (property.type === "ObjectProperty") {
			let propName = ""

			// Get property name
			if (property.key.type === "Identifier") {
				propName = property.key.name
			} else if (property.key.type === "StringLiteral") {
				propName = property.key.value
			}

			if (!propName) continue

			const shouldConvert = shouldConvertProperty(propName, options.propList)

			// Process different value types
			if (property.value.type === "StringLiteral") {
				if (!shouldConvert) continue
				const originalValue = property.value.value
				const pxRegex = /(-?\d*\.?\d+)px/g
				if (pxRegex.test(originalValue)) {
					const newValue = originalValue.replace(pxRegex, (_, numStr) => pxtorem(numStr))
					if (newValue !== originalValue) {
						property.value.value = newValue
						hasChanges = true
					}
				}
			} else if (property.value.type === "NumericLiteral") {
				if (!shouldConvert) continue
				if (isLengthProperty(propName)) {
					const newValue = pxtorem(property.value.value)
					// Replace numeric literal with string literal
					property.value = {
						type: "StringLiteral",
						value: newValue,
					} as StringLiteral
					hasChanges = true
				}
			} else if (property.value.type === "TemplateLiteral") {
				// Only process template literals without variable expressions
				if (!shouldConvert || hasVariableExpressions(property.value)) continue

				if (processTemplateQuasis(property.value, options)) {
					hasChanges = true
				}
			} else if (property.value.type === "ConditionalExpression") {
				// Handle conditional property values like { padding: condition ? 10 : 20 }
				if (processConditionalPropertyValue(property.value, propName, options)) {
					hasChanges = true
				}
			}
		}
	}

	return hasChanges
}

/**
 * Process conditional expressions in JSX style objects
 * Handles patterns like: condition ? { style1 } : { style2 }
 */
export function processConditionalExpression(
	conditionalExpression: ConditionalExpression,
	options: ProcessOptions,
): boolean {
	let hasChanges = false

	// Process consequent (true branch)
	if (conditionalExpression.consequent.type === "ObjectExpression") {
		if (processStyleObjectExpression(conditionalExpression.consequent, options)) {
			hasChanges = true
		}
	} else if (conditionalExpression.consequent.type === "ConditionalExpression") {
		// Handle nested conditional expressions
		if (processConditionalExpression(conditionalExpression.consequent, options)) {
			hasChanges = true
		}
	}

	// Process alternate (false branch)
	if (conditionalExpression.alternate.type === "ObjectExpression") {
		if (processStyleObjectExpression(conditionalExpression.alternate, options)) {
			hasChanges = true
		}
	} else if (conditionalExpression.alternate.type === "ConditionalExpression") {
		// Handle nested conditional expressions
		if (processConditionalExpression(conditionalExpression.alternate, options)) {
			hasChanges = true
		}
	}

	return hasChanges
}

/**
 * Process conditional property values in style objects
 * Handles patterns like: { padding: condition ? 10 : 20 }
 */
export function processConditionalPropertyValue(
	conditionalExpression: ConditionalExpression,
	propName: string,
	options: ProcessOptions,
): boolean {
	let hasChanges = false

	const shouldConvert = shouldConvertProperty(propName, options.propList)
	if (!shouldConvert) return false

	const pxtorem = createPxToRemConverter({
		rootValue: options.rootValue,
		unitPrecision: options.unitPrecision,
		minPixelValue: options.minPixelValue,
	})

	// Process consequent (true branch)
	if (conditionalExpression.consequent.type === "NumericLiteral") {
		if (isLengthProperty(propName)) {
			const newValue = pxtorem(conditionalExpression.consequent.value)
			conditionalExpression.consequent = {
				type: "StringLiteral",
				value: newValue,
			} as StringLiteral
			hasChanges = true
		}
	} else if (conditionalExpression.consequent.type === "StringLiteral") {
		const originalValue = conditionalExpression.consequent.value
		const pxRegex = /(-?\d*\.?\d+)px/g
		if (pxRegex.test(originalValue)) {
			const newValue = originalValue.replace(pxRegex, (_, numStr) => pxtorem(numStr))
			if (newValue !== originalValue) {
				conditionalExpression.consequent.value = newValue
				hasChanges = true
			}
		}
	} else if (conditionalExpression.consequent.type === "ConditionalExpression") {
		// Handle nested conditional expressions
		if (processConditionalPropertyValue(conditionalExpression.consequent, propName, options)) {
			hasChanges = true
		}
	}

	// Process alternate (false branch)
	if (conditionalExpression.alternate.type === "NumericLiteral") {
		if (isLengthProperty(propName)) {
			const newValue = pxtorem(conditionalExpression.alternate.value)
			conditionalExpression.alternate = {
				type: "StringLiteral",
				value: newValue,
			} as StringLiteral
			hasChanges = true
		}
	} else if (conditionalExpression.alternate.type === "StringLiteral") {
		const originalValue = conditionalExpression.alternate.value
		const pxRegex = /(-?\d*\.?\d+)px/g
		if (pxRegex.test(originalValue)) {
			const newValue = originalValue.replace(pxRegex, (_, numStr) => pxtorem(numStr))
			if (newValue !== originalValue) {
				conditionalExpression.alternate.value = newValue
				hasChanges = true
			}
		}
	} else if (conditionalExpression.alternate.type === "ConditionalExpression") {
		// Handle nested conditional expressions
		if (processConditionalPropertyValue(conditionalExpression.alternate, propName, options)) {
			hasChanges = true
		}
	}

	return hasChanges
}
