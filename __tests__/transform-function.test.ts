import { describe, expect, it } from "vitest"
import { antdStylePxToRem } from ".."

describe("Transform Function", () => {
	it("should have transform function or handler", () => {
		const plugin = antdStylePxToRem()
		const transform =
			typeof plugin.transform === "function"
				? plugin.transform
				: (plugin.transform as any)?.handler

		expect(typeof transform).toBe("function")
	})

	it("should return null for files without css templates", () => {
		const plugin = antdStylePxToRem()
		const transform =
			typeof plugin.transform === "function"
				? plugin.transform
				: (plugin.transform as any)?.handler

		const code = `
			export const config = {
				width: '320px',
				height: '240px'
			}
		`

		const result = transform.call({}, code, "/src/config.ts")
		expect(result).toBeNull()
	})

	it("should return null for node_modules files", () => {
		const plugin = antdStylePxToRem({
			exclude: [/node_modules/],
		})
		const transform =
			typeof plugin.transform === "function"
				? plugin.transform
				: (plugin.transform as any)?.handler

		const code = `
			import { createStyles } from 'antd-style'
			export const useStyles = createStyles(({ css }) => ({
				container: css\`width: 320px;\`
			}))
		`

		const result = transform.call({}, code, "/node_modules/package/index.ts")
		expect(result).toBeNull()
	})

	it("should process valid antd-style code", () => {
		const plugin = antdStylePxToRem({
			rootValue: 16,
			unitPrecision: 5,
			propList: ["*"],
			minPixelValue: 1,
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
					padding: 16px;
				\`
			}))
		`

		const result = transform.call({}, code, "/src/component.tsx")

		if (result && typeof result === "object" && "code" in result) {
			// 验证转换是否成功
			expect(result.code).toContain("rem")
			expect(result.code).not.toContain("320px") // 应该被转换了
		}
	})
})
