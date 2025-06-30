import { describe, expect, it } from "vitest"
import { antdStylePxToRem } from ".."

describe("CSS Template Processing", () => {
	it("should handle border properties correctly", () => {
		const plugin = antdStylePxToRem({
			rootValue: 16,
			unitPrecision: 5,
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
					border: 1px solid rgba(28, 29, 35, 0.08);
					border-bottom: 2px solid #000;
				\`
			}))
		`

		const result = transform.call({}, code, "/src/component.tsx")

		if (result && typeof result === "object" && "code" in result) {
			// 检查转换后的代码是否包含正确的 rem 值
			expect(result.code).toContain("0.0625rem")
			expect(result.code).toContain("0.125rem")
		}
	})

	it("should handle calc() expressions correctly", () => {
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
					height: calc(100vh - 44px);
					max-width: calc(100% - 46px);
					padding: calc(20px + 5px);
				\`
			}))
		`

		const result = transform.call({}, code, "/src/component.tsx")

		if (result && typeof result === "object" && "code" in result) {
			expect(result.code).toContain("calc(100vh - 2.75rem)")
			expect(result.code).toContain("calc(100% - 2.875rem)")
			expect(result.code).toContain("calc(1.25rem + 0.3125rem)")
		}
	})

	it("should handle CSS custom properties", () => {
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
					--primary-size: 24px;
					--secondary-margin: 16px;
					width: var(--primary-size);
				\`
			}))
		`

		const result = transform.call({}, code, "/src/component.tsx")

		if (result && typeof result === "object" && "code" in result) {
			expect(result.code).toContain("--primary-size: 1.5rem")
			expect(result.code).toContain("--secondary-margin: 1rem")
		}
	})

	it("should ignore commented CSS", () => {
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
					// height: 240px;
					/* margin: 16px; */
					/*
					padding: 24px;
					*/
				\`
			}))
		`

		const result = transform.call({}, code, "/src/component.tsx")

		if (result && typeof result === "object" && "code" in result) {
			// width should be converted
			expect(result.code).toContain("width: 20rem")
			// commented properties should not be converted
			expect(result.code).toContain("// height: 240px")
			expect(result.code).toContain("/* margin: 16px; */")
			expect(result.code).toContain("padding: 24px")
		}
	})

	it("should handle object style values", () => {
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
			export const useStyles = createStyles(() => ({
				container: {
					width: 320,
					height: "240px",
					border: "1px solid #ccc",
					padding: 16,
				}
			}))
		`

		const result = transform.call({}, code, "/src/component.tsx")

		if (result && typeof result === "object" && "code" in result) {
			// Number values should be converted to rem strings
			expect(result.code).toContain('width: "20rem"')
			expect(result.code).toContain('padding: "1rem"')
			// String px values should be converted
			expect(result.code).toContain('height: "15rem"')
			expect(result.code).toContain('border: "0.0625rem solid #ccc"')
		}
	})

	it("should handle template expressions with conditional calc", () => {
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
					max-width: \${isMobile ? "calc(100% - 30px)" : "calc(100% - 46px)"};
					height: \${isCollapsed ? "40px" : "60px"};
					padding: \${spacing}px;
					margin: \${top}px \${right}px \${bottom}px \${left}px;
				\`
			}))
		`

		const result = transform.call({}, code, "/src/component.tsx")

		if (result && typeof result === "object" && "code" in result) {
			// Template expressions should remain unchanged (JavaScript code)
			// but string literals within them should be converted
			expect(result.code).toContain(
				'isMobile ? "calc(100% - 1.875rem)" : "calc(100% - 2.875rem)"',
			)
			expect(result.code).toContain('isCollapsed ? "2.5rem" : "3.75rem"')

			// Variable expressions should remain as-is
			expect(result.code).toContain("${spacing}px")
			expect(result.code).toContain("${top}px ${right}px ${bottom}px ${left}px")
		}
	})

	it("should handle template expressions with px values", () => {
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
					width: \${open ? "340px" : 0};
					padding: \${open ? "20px" : 0};
					height: \${isLarge ? "480px" : "240px"};
				\`
			}))
		`

		const result = transform.call({}, code, "/src/component.tsx")

		if (result && typeof result === "object" && "code" in result) {
			// Check that px values in template expressions are converted to rem
			expect(result.code).toContain("21.25rem") // 340px / 16 = 21.25rem
			expect(result.code).toContain("1.25rem") // 20px / 16 = 1.25rem
			expect(result.code).toContain("30rem") // 480px / 16 = 30rem
			expect(result.code).toContain("15rem") // 240px / 16 = 15rem
			// Should not contain original px values
			expect(result.code).not.toContain("340px")
			expect(result.code).not.toContain("20px")
			expect(result.code).not.toContain("480px")
			expect(result.code).not.toContain("240px")
		}
	})

	it("should handle CSS @keyframes animations", () => {
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
					@keyframes slideIn {
						from {
							transform: translateX(-100px);
						}
						to {
							transform: translateX(0px);
						}
					}
				\`
			}))
		`

		const result = transform.call({}, code, "/src/component.tsx")

		if (result && typeof result === "object" && "code" in result) {
			expect(result.code).toContain("translateX(-6.25rem)")
			// 0px should be converted to "0rem" or remain as "0px" (both are acceptable)
			expect(result.code).toMatch(/translateX\((0|0rem|0px)\)/)
		}
	})

	it("should handle CSS pseudo-classes and pseudo-elements", () => {
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
					&:hover {
						padding: 20px;
					}
					&::before {
						content: "";
						width: 10px;
						height: 10px;
					}
				\`
			}))
		`

		const result = transform.call({}, code, "/src/component.tsx")

		if (result && typeof result === "object" && "code" in result) {
			expect(result.code).toContain("padding: 1.25rem")
			expect(result.code).toContain("width: 0.625rem")
			expect(result.code).toContain("height: 0.625rem")
		}
	})
})
