import { describe, expect, it } from "vitest"
import { antdStylePxToRem } from ".."

describe("Ignore Comments Support", () => {
	it("should ignore CSS properties with antd-style-px-to-rem ignore comment", () => {
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
					width: 320px;
					/** antd-style-px-to-rem ignore */
					height: 240px;
					/* antd-style-px-to-rem ignore */
					margin: 16px;
					padding: 12px;
				\`
			}))
		`

		const result = transform.call({}, code, "/src/component.tsx")

		if (result && typeof result === "object" && "code" in result) {
			// width and padding should be converted
			expect(result.code).toContain("width: 20rem")
			expect(result.code).toContain("padding: 0.75rem")
			// height and margin should not be converted (ignored)
			expect(result.code).toContain("height: 240px")
			expect(result.code).toContain("margin: 16px")
		}
	})

	it("should ignore JSX attributes with antd-style-px-to-rem ignore comment", () => {
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
			import { Flex } from 'antd'
			
			const Component = () => {
				return (
					<div>
						<Flex gap={16}>Normal conversion</Flex>
						{/** antd-style-px-to-rem ignore */}
						<Flex gap={24}>Should not convert</Flex>
					</div>
				)
			}
		`

		const result = transform.call({}, code, "/src/component.tsx")

		if (result && typeof result === "object" && "code" in result) {
			// First Flex should be converted
			expect(result.code).toContain('gap={"1rem"}')
			// Second Flex should not be converted (ignored)
			expect(result.code).toContain("gap={24}")
		}
	})

	it("should handle ignore comment on same line as CSS property", () => {
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
					width: 320px;
					height: 240px; /** antd-style-px-to-rem ignore */
					margin: 16px; /* antd-style-px-to-rem ignore */
					padding: 12px;
				\`
			}))
		`

		const result = transform.call({}, code, "/src/component.tsx")

		if (result && typeof result === "object" && "code" in result) {
			// width and padding should be converted
			expect(result.code).toContain("width: 20rem")
			expect(result.code).toContain("padding: 0.75rem")
			// height and margin should not be converted (ignored)
			expect(result.code).toContain("height: 240px")
			expect(result.code).toContain("margin: 16px")
		}
	})

	it("should handle malformed ignore comments gracefully", () => {
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
					width: 320px;
					/* antd-style-px-to-rem ignore */ /* Multiple comments */
					height: 240px;
					/* antd-style-px-to-rem ignore
					margin: 16px; /* Unclosed comment */
					padding: 12px;
					/* antd-style-px-to-rem-ignore */ /* Wrong format */
					border: 2px;
				\`
			}))
		`

		// Should not throw and handle gracefully
		expect(() => {
			const result = transform.call({}, code, "/src/component.tsx")
			expect(result).toBeTruthy()
		}).not.toThrow()
	})

	it("should handle ignore comments with different variations", () => {
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
					width: 320px;
					/*antd-style-px-to-rem ignore*/
					height: 240px;
					/* antd-style-px-to-rem ignore */
					margin: 16px;
					/**antd-style-px-to-rem ignore**/
					padding: 12px;
					/* antd-style-px-to-rem IGNORE */ /* Case insensitive? */
					border: 2px;
				\`
			}))
		`

		const result = transform.call({}, code, "/src/component.tsx")

		if (result && typeof result === "object" && "code" in result) {
			// width should be converted
			expect(result.code).toContain("width: 20rem")
			// height, margin, padding should not be converted (various ignore formats)
			expect(result.code).toContain("height: 240px")
			expect(result.code).toContain("margin: 16px")
			expect(result.code).toContain("padding: 12px")
			// border should be converted (case sensitive - uppercase won't match)
			expect(result.code).toContain("border: 0.125rem")
		}
	})

	it("should handle ignore comments in template expressions", () => {
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
			export const useStyles = createStyles(({ css }, { open }: { open: boolean }) => ({
				container: css\`
					width: \${open ? "320px" : "240px"};
					/** antd-style-px-to-rem ignore */
					height: \${open ? "400px" : "300px"};
					margin: 16px; /* antd-style-px-to-rem ignore */
					padding: \${open ? "20px" : "10px"};
				\`
			}))
		`

		const result = transform.call({}, code, "/src/component.tsx")

		if (result && typeof result === "object" && "code" in result) {
			// Template expressions should be converted normally
			expect(result.code).toContain("20rem")
			expect(result.code).toContain("15rem")
			expect(result.code).toContain("1.25rem")
			expect(result.code).toContain("0.625rem")
			// margin should not be converted (ignored)
			expect(result.code).toContain("margin: 16px")
			// But template expressions after ignore should still convert
			expect(result.code).toContain("25rem") // 400px
			expect(result.code).toContain("18.75rem") // 300px
		}
	})

	it("should handle ignore comments in conditional expressions", () => {
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
			
			const Component = ({ condition }: { condition: boolean }) => {
				return (
					<div>
						{/** antd-style-px-to-rem ignore */}
						<div
							style={
								condition
									? { padding: 16, margin: 8 }
									: { padding: 12, margin: 6 }
							}
						>
							Should not convert
						</div>
						<div
							style={
								condition
									? { padding: 20, margin: 10 }
									: { padding: 24, margin: 12 }
							}
						>
							Should convert
						</div>
					</div>
				)
			}
		`

		const result = transform.call({}, code, "/src/component.tsx")

		if (result && typeof result === "object" && "code" in result) {
			// First div should not be converted (ignored)
			expect(result.code).toContain("padding: 16")
			expect(result.code).toContain("margin: 8")
			expect(result.code).toContain("padding: 12")
			expect(result.code).toContain("margin: 6")
			// Second div should be converted
			expect(result.code).toContain('"1.25rem"') // 20/16 = 1.25rem
			expect(result.code).toContain('"0.625rem"') // 10/16 = 0.625rem
			expect(result.code).toContain('"1.5rem"') // 24/16 = 1.5rem
			expect(result.code).toContain('"0.75rem"') // 12/16 = 0.75rem
		}
	})

	it("should handle edge cases with JSX ignore comments", () => {
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
			import { Flex } from 'antd'
			
			const Component = () => {
				return (
					<div>
						{/* antd-style-px-to-rem ignore */}
						<Flex gap={16}>Should not ignore - wrong comment format</Flex>
						{/* */ /** antd-style-px-to-rem ignore */ /* */}
						<Flex gap={24}>Multiple comments - should ignore</Flex>
						{/** antd-style-px-to-rem ignore */}
						<Flex gap={32}>Multiline JSX</Flex>
					</div>
				)
			}
		`

		const result = transform.call({}, code, "/src/component.tsx")

		if (result && typeof result === "object" && "code" in result) {
			// First Flex should be converted (wrong comment format)
			expect(result.code).toContain('gap={"1rem"}')
			// Second Flex should not be converted (correct ignore)
			expect(result.code).toContain("gap={24}")
			// Third Flex should not be converted (multiline ignore)
			expect(result.code).toContain("gap={32}")
		}
	})

	it("should handle nested comments and complex CSS scenarios", () => {
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
					/* Regular comment */
					width: 320px;
					/* 
					 * Multi-line comment
					 * /** antd-style-px-to-rem ignore */ inside multi-line
					 */
					height: 240px;
					/** antd-style-px-to-rem ignore */
					/* Nested comment start
					margin: 16px; /* antd-style-px-to-rem ignore */
					/* Nested comment end */
					padding: 12px;
				\`
			}))
		`

		// Should not throw and handle gracefully
		expect(() => {
			const result = transform.call({}, code, "/src/component.tsx")
			expect(result).toBeTruthy()
		}).not.toThrow()
	})
})
