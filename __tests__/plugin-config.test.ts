import { describe, it, expect } from "vitest"
import { antdStylePxToRem } from ".."

describe("Plugin Configuration", () => {
	it("should create plugin with default options", () => {
		const plugin = antdStylePxToRem()
		expect(plugin.name).toBe("antd-style-px-to-rem")
		expect(plugin).toHaveProperty("transform")
	})

	it("should create plugin with custom options", () => {
		const plugin = antdStylePxToRem({
			rootValue: 32,
			unitPrecision: 3,
			cssTemplateFunctions: ["css", "styled"],
		})
		expect(plugin.name).toBe("antd-style-px-to-rem")
		expect(plugin).toHaveProperty("transform")
	})
})
