import { describe, expect, it, vi } from "vitest"
import { antdStylePxToRem } from ".."

describe("Error Handling", () => {
	it("should handle malformed code gracefully", () => {
		const plugin = antdStylePxToRem()
		const transform =
			typeof plugin.transform === "function"
				? plugin.transform
				: (plugin.transform as any)?.handler

		const malformedCode = `
			import { createStyles from 'antd-style' // 缺少引号
			export const useStyles = createStyles(({ css }) => ({
				container: css\`width: 320px;\`
			}))
		`

		// 应该不抛出错误
		expect(() => {
			const result = transform.call({}, malformedCode, "/src/component.tsx")
			expect(result).toBeNull()
		}).not.toThrow()
	})

	it("should handle empty CSS gracefully", () => {
		const plugin = antdStylePxToRem()
		const transform =
			typeof plugin.transform === "function"
				? plugin.transform
				: (plugin.transform as any)?.handler

		const code = `
			import { createStyles } from 'antd-style'
			export const useStyles = createStyles(({ css }) => ({
				container: css\`\`
			}))
		`

		const result = transform.call({}, code, "/src/component.tsx")
		expect(result).toBeNull()
	})

	it("should handle module import errors gracefully", () => {
		// Mock console.error to avoid noise in test output
		const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {
			// Mock implementation to avoid console noise
		})

		const plugin = antdStylePxToRem()
		const transform =
			typeof plugin.transform === "function"
				? plugin.transform
				: (plugin.transform as any)?.handler

		// JavaScript/TypeScript code with syntax error that would trigger babel parser error
		const invalidCode = `
			import { createStyles from 'antd-style' // Missing closing brace
			export const useStyles = createStyles(({ css }) => ({
				container: css\`width: 320px;\`
			}))
		`

		// Should not throw and return null
		expect(() => {
			const result = transform.call({}, invalidCode, "/src/component.tsx")
			expect(result).toBeNull()
		}).not.toThrow()

		expect(consoleErrorSpy).toHaveBeenCalled()

		consoleErrorSpy.mockRestore()
	})

	it("should handle empty propList correctly", () => {
		const plugin = antdStylePxToRem({
			rootValue: 16,
			propList: [], // Empty list - should not convert anything
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
				\`
			}))
		`

		const result = transform.call({}, code, "/src/component.tsx")

		// Should return null as no conversion should happen
		expect(result).toBeNull()
	})
})
