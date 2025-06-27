import type { TemplateLiteral } from "./types"
import { lengthProperties } from "./constants"

/**
 * Check if a file should be processed based on include/exclude patterns
 */
export function shouldProcess(
	id: string,
	include?: string | RegExp | (string | RegExp)[],
	exclude?: string | RegExp | (string | RegExp)[],
): boolean {
	// Check exclude patterns first
	if (exclude) {
		const excludePatterns = Array.isArray(exclude) ? exclude : [exclude]
		for (const pattern of excludePatterns) {
			if (typeof pattern === "string" && id.includes(pattern)) return false
			if (pattern instanceof RegExp && pattern.test(id)) return false
		}
	}

	// Check include patterns
	if (include) {
		const includePatterns = Array.isArray(include) ? include : [include]
		return includePatterns.some((pattern) => {
			if (typeof pattern === "string") return id.includes(pattern)
			if (pattern instanceof RegExp) return pattern.test(id)
			return false
		})
	}

	// Default: process .ts, .tsx, .js, .jsx files
	return /\.(tsx?|jsx?)$/.test(id)
}

/**
 * Check if a CSS property should be converted based on propList configuration
 */
export function shouldConvertProperty(propName: string, propList: string[]): boolean {
	// If propList is empty, don't convert anything
	if (propList.length === 0) {
		return false
	}

	// Check for wildcard - convert all properties
	const hasWildcard = propList.includes("*")

	// Get exclusion list (properties starting with !)
	const exclusions = propList
		.filter((prop) => prop.startsWith("!"))
		.map((prop) => prop.substring(1))

	// Get inclusion list (properties not starting with !)
	const inclusions = propList.filter((prop) => !prop.startsWith("!"))

	// If property is explicitly excluded, don't convert
	if (exclusions.includes(propName)) {
		return false
	}

	// If wildcard is present and property is not excluded, convert
	if (hasWildcard) {
		return true
	}

	// Otherwise, only convert if property is in inclusion list
	return inclusions.includes(propName)
}

/**
 * Check if a property is a length property that should be converted
 */
export function isLengthProperty(propName: string): boolean {
	return lengthProperties.has(propName)
}

/**
 * Check if template literal contains variable expressions
 */
export function hasVariableExpressions(template: TemplateLiteral): boolean {
	return template.expressions.length > 0
}

/**
 * Create a px to rem conversion function with given options
 */
export function createPxToRemConverter(options: {
	rootValue: number
	unitPrecision: number
	minPixelValue: number
}) {
	return function pxtorem(value: string | number): string {
		const num = typeof value === "string" ? parseFloat(value) : value
		if (isNaN(num) || Math.abs(num) <= options.minPixelValue) {
			return String(value)
		}
		const rem = num / options.rootValue
		const remValue = parseFloat(rem.toFixed(options.unitPrecision))
		if (remValue === 0) {
			return "0"
		}
		return `${remValue}rem`
	}
}
