import { describe, expect, it } from "vitest"
import { antdStylePxToRem } from ".."

describe("Conditional Expression Support", () => {
	it("should handle conditional style objects", () => {
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
			
			const Component = ({ isEmptyStatus }: { isEmptyStatus: boolean }) => {
				return (
					<div
						style={
							isEmptyStatus
								? undefined
								: { paddingBottom: 100 }
						}
					>
						Content
					</div>
				)
			}
		`

		const result = transform.call({}, code, "/src/component.tsx")

		if (result && typeof result === "object" && "code" in result) {
			// paddingBottom should be converted in the false branch
			expect(result.code).toContain('paddingBottom: "6.25rem"')
			// undefined branch should remain unchanged
			expect(result.code).toContain("undefined")
			// Should not contain original px value
			expect(result.code).not.toContain("paddingBottom: 100")
		}
	})

	it("should handle conditional property values", () => {
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
			
			const Component = ({ taskData }: { taskData: any }) => {
				return (
					<div
						style={{
							paddingBottom: taskData?.process.length ? 224 : 185
						}}
					>
						Content
					</div>
				)
			}
		`

		const result = transform.call({}, code, "/src/component.tsx")

		if (result && typeof result === "object" && "code" in result) {
			// Both conditional values should be converted to rem
			expect(result.code).toContain('"14rem"') // 224/16 = 14rem
			expect(result.code).toContain('"11.5625rem"') // 185/16 = 11.5625rem
			// Should not contain original numeric values
			expect(result.code).not.toContain("224")
			expect(result.code).not.toContain("185")
		}
	})

	it("should handle complex conditional patterns like the workspace scenario", () => {
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
			
			const Component = ({ isEmptyStatus, taskData }: { isEmptyStatus: boolean, taskData: any }) => {
				return (
					<div
						style={
							isEmptyStatus
								? undefined
								: { paddingBottom: taskData?.process.length ? 224 : 185 }
						}
					>
						Content
					</div>
				)
			}
		`

		const result = transform.call({}, code, "/src/component.tsx")

		if (result && typeof result === "object" && "code" in result) {
			// Should convert the nested conditional values
			expect(result.code).toContain('"14rem"') // 224/16 = 14rem
			expect(result.code).toContain('"11.5625rem"') // 185/16 = 11.5625rem
			// Should preserve the overall conditional structure
			expect(result.code).toContain("isEmptyStatus")
			expect(result.code).toContain("undefined")
			expect(result.code).toContain("taskData?.process.length")
		}
	})

	it("should handle mixed value types in conditional expressions", () => {
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
					<div
						style={{
							width: condition ? 200 : "150px",
							height: condition ? "100px" : 80,
							margin: condition ? 16 : "12px",
						}}
					>
						Content
					</div>
				)
			}
		`

		const result = transform.call({}, code, "/src/component.tsx")

		if (result && typeof result === "object" && "code" in result) {
			// All values should be converted regardless of original type
			expect(result.code).toContain('"12.5rem"') // 200/16 = 12.5rem
			expect(result.code).toContain('"9.375rem"') // 150/16 = 9.375rem
			expect(result.code).toContain('"6.25rem"') // 100/16 = 6.25rem
			expect(result.code).toContain('"5rem"') // 80/16 = 5rem
			expect(result.code).toContain('"1rem"') // 16/16 = 1rem
			expect(result.code).toContain('"0.75rem"') // 12/16 = 0.75rem
		}
	})

	it("should respect propList filtering in conditional expressions", () => {
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
			
			const Component = ({ condition }: { condition: boolean }) => {
				return (
					<div
						style={{
							width: condition ? 200 : 150,
							height: condition ? 100 : 80,
							padding: condition ? 16 : 12,
							margin: condition ? 24 : 20,
						}}
					>
						Content
					</div>
				)
			}
		`

		const result = transform.call({}, code, "/src/component.tsx")

		if (result && typeof result === "object" && "code" in result) {
			// width and height should be converted
			expect(result.code).toContain('"12.5rem"') // 200/16
			expect(result.code).toContain('"9.375rem"') // 150/16
			expect(result.code).toContain('"6.25rem"') // 100/16
			expect(result.code).toContain('"5rem"') // 80/16
			// padding and margin should NOT be converted
			expect(result.code).toContain("padding: condition ? 16 : 12")
			expect(result.code).toContain("margin: condition ? 24 : 20")
		}
	})

	it("should handle string px values in conditional expressions", () => {
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
					<div
						style={{
							border: condition ? "2px solid red" : "1px solid blue",
							boxShadow: condition ? "0 4px 8px rgba(0,0,0,0.1)" : "0 2px 4px rgba(0,0,0,0.1)",
						}}
					>
						Content
					</div>
				)
			}
		`

		const result = transform.call({}, code, "/src/component.tsx")

		if (result && typeof result === "object" && "code" in result) {
			// String px values should be converted
			expect(result.code).toContain('"0.125rem solid red"') // 2px -> 0.125rem
			expect(result.code).toContain('"0.0625rem solid blue"') // 1px -> 0.0625rem
			expect(result.code).toContain('"0 0.25rem 0.5rem rgba(0,0,0,0.1)"') // 4px 8px -> 0.25rem 0.5rem
			expect(result.code).toContain('"0 0.125rem 0.25rem rgba(0,0,0,0.1)"') // 2px 4px -> 0.125rem 0.25rem
		}
	})

	it("should handle conditional expressions with null/undefined values", () => {
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
			
			const Component = ({ show, hasData }: { show: boolean, hasData: boolean }) => {
				return (
					<div
						style={
							show 
								? { width: 200, height: hasData ? 300 : null }
								: null
						}
					>
						Content
					</div>
				)
			}
		`

		const result = transform.call({}, code, "/src/component.tsx")

		if (result && typeof result === "object" && "code" in result) {
			// Numeric values should be converted
			expect(result.code).toContain('"12.5rem"') // 200/16
			expect(result.code).toContain('"18.75rem"') // 300/16
			// null values should remain unchanged
			expect(result.code).toContain("null")
		}
	})

	it("should not process conditional expressions when enableJSXTransform is false", () => {
		const plugin = antdStylePxToRem({
			rootValue: 16,
			propList: ["*"],
			minPixelValue: 0,
			enableJSXTransform: false,
		})

		const transform =
			typeof plugin.transform === "function"
				? plugin.transform
				: (plugin.transform as any)?.handler

		const code = `
			import React from 'react'
			
			const Component = ({ condition }: { condition: boolean }) => {
				return (
					<div
						style={
							condition
								? { width: 200 }
								: { width: 150 }
						}
					>
						Content
					</div>
				)
			}
		`

		const result = transform.call({}, code, "/src/component.tsx")

		// Should return null as JSX transform is disabled
		expect(result).toBeNull()
	})

	it("should handle conditional expressions in responsive design patterns", () => {
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
			
			const Component = ({ breakpoint, orientation }: { breakpoint: string, orientation: string }) => {
				const isMobile = breakpoint === 'mobile'
				const isTablet = breakpoint === 'tablet'
				const isLandscape = orientation === 'landscape'
				
				return (
					<div
						style={
							isMobile
								? (isLandscape 
									? { padding: 12, margin: 8, fontSize: 14 }
									: { padding: 16, margin: 12, fontSize: 16 })
								: isTablet
									? { padding: 20, margin: 16, fontSize: 18 }
									: { padding: 24, margin: 20, fontSize: 20 }
						}
					>
						Content
					</div>
				)
			}
		`

		const result = transform.call({}, code, "/src/component.tsx")

		if (result && typeof result === "object" && "code" in result) {
			// All padding and margin values should be converted
			expect(result.code).toContain('"0.75rem"') // 12/16 = 0.75rem
			expect(result.code).toContain('"0.5rem"') // 8/16 = 0.5rem
			expect(result.code).toContain('"1rem"') // 16/16 = 1rem
			expect(result.code).toContain('"1.25rem"') // 20/16 = 1.25rem
			expect(result.code).toContain('"1.5rem"') // 24/16 = 1.5rem
			// fontSize should also be converted
			expect(result.code).toContain('"0.875rem"') // 14/16 = 0.875rem
			expect(result.code).toContain('"1.125rem"') // 18/16 = 1.125rem
		}
	})

	it("should handle conditional expressions with animation and transition values", () => {
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
			
			const Component = ({ animated, direction }: { animated: boolean, direction: string }) => {
				return (
					<div
						style={
							animated
								? {
									transform: direction === 'up' ? 'translateY(-20px)' : 'translateY(20px)',
									transition: 'transform 0.3s ease',
									boxShadow: direction === 'up' ? '0 8px 16px rgba(0,0,0,0.1)' : '0 4px 8px rgba(0,0,0,0.1)',
								}
								: {
									transform: 'translateY(0px)',
									boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
								}
						}
					>
						Content
					</div>
				)
			}
		`

		const result = transform.call({}, code, "/src/component.tsx")

		if (result && typeof result === "object" && "code" in result) {
			// Transform values should be converted
			expect(result.code).toContain("translateY(-1.25rem)") // -20px -> -1.25rem
			expect(result.code).toContain("translateY(1.25rem)") // 20px -> 1.25rem
			expect(result.code).toContain("translateY(0)") // 0px -> 0
			// Box shadow values should be converted
			expect(result.code).toContain("0 0.5rem 1rem rgba(0,0,0,0.1)") // 8px 16px -> 0.5rem 1rem
			expect(result.code).toContain("0 0.25rem 0.5rem rgba(0,0,0,0.1)") // 4px 8px -> 0.25rem 0.5rem
			expect(result.code).toContain("0 0.125rem 0.25rem rgba(0,0,0,0.05)") // 2px 4px -> 0.125rem 0.25rem
			// Transition should remain unchanged
			expect(result.code).toContain("transform 0.3s ease")
		}
	})
})
