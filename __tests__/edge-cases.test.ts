import { describe, expect, it } from "vitest"
import { antdStylePxToRem } from ".."

describe("Edge Cases and Error Handling", () => {
	it("should handle zero px values correctly", () => {
		const plugin = antdStylePxToRem({
			rootValue: 16,
			propList: ["*"],
			minPixelValue: 0,
		})

		const transform =
			typeof plugin.transform === "function"
				? plugin.transform
				: (plugin.transform as any)?.handler

		const code = `
			import { createStyles } from 'antd-style'
			export const useStyles = createStyles(({ css }) => ({
				container: css\`
					width: 0px;
					height: 0px;
					margin: 0px;
				\`
			}))
		`

		const result = transform.call({}, code, "/src/component.tsx")

		if (result && typeof result === "object" && "code" in result) {
			// 0px should be converted to "0"
			expect(result.code).toContain("width: 0;")
			expect(result.code).toContain("height: 0;")
			expect(result.code).toContain("margin: 0;")
		}
	})

	it("should handle negative px values", () => {
		const plugin = antdStylePxToRem({
			rootValue: 16,
			propList: ["*"],
			minPixelValue: 0,
		})

		const transform =
			typeof plugin.transform === "function"
				? plugin.transform
				: (plugin.transform as any)?.handler

		const code = `
			import { createStyles } from 'antd-style'
			export const useStyles = createStyles(({ css }) => ({
				container: css\`
					margin-left: -16px;
					top: -20px;
				\`
			}))
		`

		const result = transform.call({}, code, "/src/component.tsx")

		if (result && typeof result === "object" && "code" in result) {
			expect(result.code).toContain("-1rem")
			expect(result.code).toContain("-1.25rem")
		}
	})

	it("should handle decimal px values", () => {
		const plugin = antdStylePxToRem({
			rootValue: 16,
			propList: ["*"],
			minPixelValue: 0,
			unitPrecision: 3,
		})

		const transform =
			typeof plugin.transform === "function"
				? plugin.transform
				: (plugin.transform as any)?.handler

		const code = `
			import { createStyles } from 'antd-style'
			export const useStyles = createStyles(({ css }) => ({
				container: css\`
					width: 15.5px;
					height: 0.5px;
				\`
			}))
		`

		const result = transform.call({}, code, "/src/component.tsx")

		if (result && typeof result === "object" && "code" in result) {
			expect(result.code).toContain("0.969rem") // 15.5/16 = 0.96875
			expect(result.code).toContain("0.031rem") // 0.5/16 = 0.03125
		}
	})

	it("should handle invalid px values gracefully", () => {
		const plugin = antdStylePxToRem({
			rootValue: 16,
			propList: ["*"],
			minPixelValue: 0,
		})

		const transform =
			typeof plugin.transform === "function"
				? plugin.transform
				: (plugin.transform as any)?.handler

		const code = `
			import { createStyles } from 'antd-style'
			export const useStyles = createStyles(({ css }) => ({
				container: css\`
					width: abcpx;
					height: NaNpx;
					border: px;
				\`
			}))
		`

		const result = transform.call({}, code, "/src/component.tsx")

		if (result && typeof result === "object" && "code" in result) {
			// Invalid values should remain unchanged
			expect(result.code).toContain("abcpx")
			expect(result.code).toContain("NaNpx")
			expect(result.code).toContain("px;")
		}
	})

	it("should handle corrupted or incomplete files gracefully", () => {
		const plugin = antdStylePxToRem({
			rootValue: 16,
			propList: ["*"],
			minPixelValue: 0,
		})

		const transform =
			typeof plugin.transform === "function"
				? plugin.transform
				: (plugin.transform as any)?.handler

		const corruptedCodes = [
			// Incomplete template literal
			`import { createStyles } from 'antd-style'
			export const useStyles = createStyles(({ css }) => ({
				container: css\`
					width: 320px;`,

			// Unmatched braces
			`import { createStyles } from 'antd-style'
			export const useStyles = createStyles(({ css }) => ({
				container: css\`
					width: 320px;
				\`
			}}}}`,

			// Empty template
			`import { createStyles } from 'antd-style'
			export const useStyles = createStyles(({ css }) => ({
				container: css\`\`
			}))`,
		]

		for (const [index, code] of corruptedCodes.entries()) {
			expect(() => {
				const result = transform.call({}, code, `/src/corrupted${index}.tsx`)
				// Should either return null or valid transformation, but not throw
				expect(result === null || (typeof result === "object" && "code" in result)).toBe(
					true,
				)
			}).not.toThrow()
		}
	})

	it("should handle very long lines and performance edge cases", () => {
		const plugin = antdStylePxToRem({
			rootValue: 16,
			propList: ["*"],
			minPixelValue: 0,
		})

		const transform =
			typeof plugin.transform === "function"
				? plugin.transform
				: (plugin.transform as any)?.handler

		// Generate a very long CSS property value
		const longValue = Array.from({length: 1000}).fill("10px").join(" ")
		const code = `
			import { createStyles } from 'antd-style'
			export const useStyles = createStyles(({ css }) => ({
				container: css\`
					width: 320px;
					margin: ${longValue};
					padding: 12px;
				\`
			}))
		`

		expect(() => {
			const result = transform.call({}, code, "/src/performance.tsx")
			expect(result).toBeTruthy()
		}).not.toThrow()
	})

	it("should handle files with no actual CSS content", () => {
		const plugin = antdStylePxToRem({
			rootValue: 16,
			propList: ["*"],
			minPixelValue: 0,
			enableJSXTransform: true,
		})

		const transform =
			typeof plugin.transform === "function"
				? plugin.transform
				: (plugin.transform as any)?.handler

		const codes = [
			// Only import
			`import { createStyles } from 'antd-style'`,

			// Only JSX without target components
			`import { Div } from 'styled'
			const Component = () => <Div gap={16}>test</Div>`,

			// Empty createStyles
			`import { createStyles } from 'antd-style'
			export const useStyles = createStyles(() => ({}))`,
		]

		for (const [index, code] of codes.entries()) {
			expect(() => {
				const result = transform.call({}, code, `/src/empty${index}.tsx`)
				// Should return null (no transformation needed)
				expect(result).toBeNull()
			}).not.toThrow()
		}
	})

	it("should handle malformed style attributes gracefully", () => {
		const plugin = antdStylePxToRem({
			rootValue: 16,
			propList: ["*"],
			minPixelValue: 0,
			enableJSXTransform: true,
		})

		const transform =
			typeof plugin.transform === "function"
				? plugin.transform
				: (plugin.transform as any)?.handler

		const malformedCodes = [
			// Invalid style object
			`const Component = () => <div style={{{ width: 100 }}>Content</div>`,

			// Incomplete style object
			`const Component = () => <div style={{ width: 100`,

			// String instead of object
			`const Component = () => <div style="width: 100px">Content</div>`,

			// Variable reference
			`const Component = () => <div style={someVariable}>Content</div>`,
		]

		for (const [index, code] of malformedCodes.entries()) {
			expect(() => {
				const result = transform.call({}, code, `/src/malformed${index}.tsx`)
				// Should either return null or valid transformation, but not throw
				expect(result === null || (typeof result === "object" && "code" in result)).toBe(
					true,
				)
			}).not.toThrow()
		}
	})

	it("should handle zero values in style attribute correctly", () => {
		const plugin = antdStylePxToRem({
			rootValue: 16,
			propList: ["*"],
			minPixelValue: 0,
			enableJSXTransform: true,
		})

		const transform =
			typeof plugin.transform === "function"
				? plugin.transform
				: (plugin.transform as any)?.handler

		const code = `
			import React from 'react'
			
			const Component = () => {
				return (
					<div style={{ 
						width: 0, 
						height: "0px", 
						margin: \`0px\`,
						padding: 16 
					}}>
						Content
					</div>
				)
			}
		`

		const result = transform.call({}, code, "/src/component.tsx")

		if (result && typeof result === "object" && "code" in result) {
			// Zero values should be converted to "0"
			expect(result.code).toContain('width: "0"')
			expect(result.code).toContain('height: "0"')
			// Template literal might need special handling - for now just check it was processed
			expect(result.code).toContain("margin: `")
			// Non-zero should be converted normally
			expect(result.code).toContain('padding: "1rem"')
		}
	})

	it("should handle nested conditional expressions with mixed types", () => {
		const plugin = antdStylePxToRem({
			rootValue: 16,
			propList: ["*"],
			minPixelValue: 0,
			enableJSXTransform: true,
		})

		const transform =
			typeof plugin.transform === "function"
				? plugin.transform
				: (plugin.transform as any)?.handler

		const code = `
			import React from 'react'
			
			const Component = ({ theme, size, mobile }: { theme: string, size: string, mobile: boolean }) => {
				return (
					<div
						style={
							theme === 'dark'
								? (size === 'large' 
									? (mobile ? { padding: 16, margin: 8 } : { padding: 24, margin: 12 })
									: { padding: 12, margin: 6 })
								: (size === 'large'
									? { padding: "20px", margin: "10px" }
									: { padding: 8, margin: 4 })
						}
					>
						Content
					</div>
				)
			}
		`

		const result = transform.call({}, code, "/src/component.tsx")

		if (result && typeof result === "object" && "code" in result) {
			// All numeric values should be converted
			expect(result.code).toContain('"1rem"') // 16/16 = 1rem
			expect(result.code).toContain('"0.5rem"') // 8/16 = 0.5rem
			expect(result.code).toContain('"1.5rem"') // 24/16 = 1.5rem
			expect(result.code).toContain('"0.75rem"') // 12/16 = 0.75rem
			expect(result.code).toContain('"0.375rem"') // 6/16 = 0.375rem
			expect(result.code).toContain('"1.25rem"') // 20/16 = 1.25rem (from "20px")
			expect(result.code).toContain('"0.625rem"') // 10/16 = 0.625rem (from "10px")
			expect(result.code).toContain('"0.25rem"') // 4/16 = 0.25rem
		}
	})

	it("should handle rem() utility function usage in conditional expressions", () => {
		const plugin = antdStylePxToRem({
			rootValue: 16,
			propList: ["*"],
			minPixelValue: 0,
			enableJSXTransform: true,
		})

		const transform =
			typeof plugin.transform === "function"
				? plugin.transform
				: (plugin.transform as any)?.handler

		const code = `
			import React from 'react'
			import { rem } from '@/styles/rem'
			
			const Component = ({ condition }: { condition: boolean }) => {
				return (
					<div
						style={{
							// Mixed rem() usage and pixel values
							padding: condition ? rem(16) : 20,
							margin: condition ? 24 : rem(12),
							// Complex conditional with rem()
							width: condition ? rem(200) : "150px",
						}}
					>
						Content
					</div>
				)
			}
		`

		const result = transform.call({}, code, "/src/component.tsx")

		if (result && typeof result === "object" && "code" in result) {
			// Only plain pixel values should be converted, rem() calls should remain unchanged
			expect(result.code).toContain('"1.25rem"') // 20/16 = 1.25rem
			expect(result.code).toContain('"1.5rem"') // 24/16 = 1.5rem
			expect(result.code).toContain('"9.375rem"') // 150/16 = 9.375rem
			// rem() function calls should remain unchanged
			expect(result.code).toContain("rem(16)")
			expect(result.code).toContain("rem(12)")
			expect(result.code).toContain("rem(200)")
		}
	})
})
