import type {
	Node,
	TaggedTemplateExpression,
	TemplateLiteral,
	CallExpression,
	ObjectProperty,
	Expression,
	StringLiteral,
	JSXElement,
	ObjectExpression,
	ConditionalExpression,
} from "@babel/types"

export interface AntdStylePxToRemOptions {
	/**
	 * Root value for px to rem conversion
	 * @default 16
	 */
	rootValue?: number
	/**
	 * Decimal precision for rem values
	 * @default 5
	 */
	unitPrecision?: number
	/**
	 * Minimum pixel value to convert
	 * @default 0
	 */
	minPixelValue?: number
	/**
	 * Properties to convert (supports wildcards)
	 * @default ['*']
	 */
	propList?: string[]
	/**
	 * Selectors to ignore (for future use)
	 * @default []
	 */
	selectorBlackList?: (string | RegExp)[]
	/**
	 * Whether to replace original values or add alongside
	 * @default true
	 */
	replace?: boolean
	/**
	 * Whether to convert px in media queries
	 * @default false
	 */
	mediaQuery?: boolean
	/**
	 * File patterns to include
	 */
	include?: string | RegExp | (string | RegExp)[]
	/**
	 * File patterns to exclude
	 */
	exclude?: string | RegExp | (string | RegExp)[]
	/**
	 * CSS template function names to process
	 * @default ['css']
	 */
	cssTemplateFunctions?: string[]
	/**
	 * Enable JSX attribute conversion (style, gap, etc.)
	 * @default true
	 */
	enableJSXTransform?: boolean
	/**
	 * Component-property mapping for JSX attribute conversion
	 * @example { "Flex": ["gap"], "Button": ["size"] }
	 * @default {}
	 */
	jsxAttributeMapping?: Record<string, string[]>
}

export interface ProcessOptions {
	rootValue: number
	unitPrecision: number
	minPixelValue: number
	propList: string[]
	replace: boolean
	mediaQuery: boolean
}

// Re-export Babel types for convenience
export type {
	Node,
	TaggedTemplateExpression,
	TemplateLiteral,
	CallExpression,
	ObjectProperty,
	Expression,
	StringLiteral,
	JSXElement,
	ObjectExpression,
	ConditionalExpression,
}
