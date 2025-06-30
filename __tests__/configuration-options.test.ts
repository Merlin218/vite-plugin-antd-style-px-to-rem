import { describe, expect, it } from "vitest"
import { antdStylePxToRem } from ".."

describe("Configuration Options", () => {
	it("should respect custom rootValue", () => {
		const plugin = antdStylePxToRem({
			rootValue: 32, // 使用32px作为基准
			unitPrecision: 3,
		})

		const transform =
			typeof plugin.transform === "function"
				? plugin.transform
				: (plugin.transform as any)?.handler

		const code = `
			import { createStyles } from 'antd-style'
			export const useStyles = createStyles(({ css }) => ({
				container: css\`width: 64px;\` // 64px / 32 = 2rem
			}))
		`

		const result = transform.call({}, code, "/src/component.tsx")

		if (result && typeof result === "object" && "code" in result) {
			expect(result.code).toContain("2rem")
		}
	})

	it("should process custom CSS function names", () => {
		const plugin = antdStylePxToRem({
			cssTemplateFunctions: ["customCss"],
		})

		const transform =
			typeof plugin.transform === "function"
				? plugin.transform
				: (plugin.transform as any)?.handler

		const code1 = `
			export const useStyles = createStyles(({ css }) => ({
				container: css\`width: 320px;\` // 不应该被处理
			}))
		`

		const code2 = `
			export const useStyles = createStyles(({ customCss }) => ({
				container: customCss\`width: 320px;\` // 应该被处理
			}))
		`

		const result1 = transform.call({}, code1, "/src/component1.tsx")
		const result2 = transform.call({}, code2, "/src/component2.tsx")

		expect(result1).toBeNull() // css 不被处理
		expect(result2).not.toBeNull() // customCss 被处理
	})

	it("should respect propList inclusion", () => {
		const plugin = antdStylePxToRem({
			rootValue: 16,
			propList: ["width", "height"], // Only convert width and height
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
					height: 240px;
					margin: 16px;
					padding: 8px;
				\`
			}))
		`

		const result = transform.call({}, code, "/src/component.tsx")

		if (result && typeof result === "object" && "code" in result) {
			// width and height should be converted
			expect(result.code).toContain("width: 20rem")
			expect(result.code).toContain("height: 15rem")
			// margin and padding should not be converted
			expect(result.code).toContain("margin: 16px")
			expect(result.code).toContain("padding: 8px")
		}
	})

	it("should respect propList exclusion", () => {
		const plugin = antdStylePxToRem({
			rootValue: 16,
			propList: ["*", "!font-size", "!line-height"], // Convert all except font-size and line-height
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
					height: 240px;
					font-size: 16px;
					line-height: 24px;
				\`
			}))
		`

		const result = transform.call({}, code, "/src/component.tsx")

		if (result && typeof result === "object" && "code" in result) {
			// width and height should be converted
			expect(result.code).toContain("width: 20rem")
			expect(result.code).toContain("height: 15rem")
			// font-size and line-height should not be converted
			expect(result.code).toContain("font-size: 16px")
			expect(result.code).toContain("line-height: 24px")
		}
	})

	it("should handle unitPrecision correctly", () => {
		const plugin = antdStylePxToRem({
			rootValue: 16,
			propList: ["*"],
			unitPrecision: 2, // Only 2 decimal places
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
					width: 15px; // 15/16 = 0.9375 -> should round to 0.94
				\`
			}))
		`

		const result = transform.call({}, code, "/src/component.tsx")

		if (result && typeof result === "object" && "code" in result) {
			expect(result.code).toContain("0.94rem")
			expect(result.code).not.toContain("0.9375rem")
		}
	})

	it("should respect minPixelValue in template expressions", () => {
		const plugin = antdStylePxToRem({
			rootValue: 16,
			propList: ["*"],
			minPixelValue: 10, // Don't convert values below 10px
		})

		const transform =
			typeof plugin.transform === "function"
				? plugin.transform
				: (plugin.transform as any)?.handler

		const code = `
			import { createStyles } from 'antd-style'
			
			export const useStyles = createStyles(({ css }, { open }: { open: boolean }) => ({
				container: css\`
					width: \${open ? "320px" : 0};
					border-width: \${active ? "2px" : "1px"};
				\`
			}))
		`

		const result = transform.call({}, code, "/src/component.tsx")

		if (result && typeof result === "object" && "code" in result) {
			// 320px should be converted (>= 10px)
			expect(result.code).toContain("20rem")
			expect(result.code).not.toContain("320px")
			// 2px and 1px should not be converted (< 10px)
			expect(result.code).toContain("2px")
			expect(result.code).toContain("1px")
		}
	})

	it("should respect minPixelValue for JSX attributes", () => {
		const plugin = antdStylePxToRem({
			rootValue: 16,
			propList: ["*"],
			minPixelValue: 10, // Don't convert values <= 10
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
						<Flex gap={8}>Small gap - should not convert</Flex>
						<Flex gap={16}>Large gap - should convert</Flex>
					</div>
				)
			}
		`

		const result = transform.call({}, code, "/src/component.tsx")

		if (result && typeof result === "object" && "code" in result) {
			// 8 should not be converted (below minPixelValue)
			expect(result.code).toContain("gap={8}")
			// 16 should be converted to "1rem"
			expect(result.code).toContain('gap={"1rem"}')
			expect(result.code).not.toContain("gap={16}")
		}
	})

	it("should respect propList filtering for style attributes", () => {
		const plugin = antdStylePxToRem({
			rootValue: 16,
			propList: ["width", "height"], // Only convert width and height
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
						width: 100,
						height: 200,
						padding: 16,
						margin: 8
					}}>
						Content
					</div>
				)
			}
		`

		const result = transform.call({}, code, "/src/component.tsx")

		if (result && typeof result === "object" && "code" in result) {
			// width and height should be converted
			expect(result.code).toContain('width: "6.25rem"')
			expect(result.code).toContain('height: "12.5rem"')
			// padding and margin should NOT be converted
			expect(result.code).toContain("padding: 16")
			expect(result.code).toContain("margin: 8")
		}
	})
})
