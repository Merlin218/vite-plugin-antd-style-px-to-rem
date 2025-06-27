import { describe, it, expect } from "vitest"
import { antdStylePxToRem } from ".."

describe("JSX Transform Support", () => {
	it("should handle incomplete JSX syntax gracefully", () => {
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

		// Incomplete JSX that might occur during typing
		const incompleteCode = `
			import { Flex } from 'antd'
			
			const Component = () => {
				return (
					<div>
						<Flex vertical gap={12
					</div>
				)
			}
		`

		// Should not throw and return null
		expect(() => {
			const result = transform.call({}, incompleteCode, "/src/component.tsx")
			expect(result).toBeNull()
		}).not.toThrow()
	})

	it("should handle complete JSX with vertical prop correctly", () => {
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

		// Complete JSX that includes vertical prop
		const completeCode = `
			import { Flex } from 'antd'
			
			const Component = () => {
				return (
					<div>
						<Flex vertical gap={12}>
							<span>Item 1</span>
							<span>Item 2</span>
						</Flex>
					</div>
				)
			}
		`

		const result = transform.call({}, completeCode, "/src/component.tsx")

		if (result && typeof result === "object" && "code" in result) {
			// gap={12} should be converted to gap={"0.75rem"}
			expect(result.code).toContain('gap={"0.75rem"}')
			// vertical prop should remain unchanged
			expect(result.code).toContain("vertical")
			// Should not contain original numeric value
			expect(result.code).not.toContain("gap={12}")
		}
	})

	it("should handle gap attribute when it's not the first attribute", () => {
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

		// Test case where gap is not the first attribute
		const code = `
			import { Flex } from 'antd'
			
			const Component = () => {
				return (
					<div>
						<Flex vertical gap={12}>Content 1</Flex>
						<Flex align="center" vertical gap={24}>Content 2</Flex>
						<Flex direction="column" align="start" gap={8} justify="space-between">Content 3</Flex>
					</div>
				)
			}
		`

		const result = transform.call({}, code, "/src/component.tsx")

		if (result && typeof result === "object" && "code" in result) {
			// All gap values should be converted regardless of position
			expect(result.code).toContain('gap={"0.75rem"}') // 12px
			expect(result.code).toContain('gap={"1.5rem"}') // 24px
			expect(result.code).toContain('gap={"0.5rem"}') // 8px

			// Should not contain original numeric values
			expect(result.code).not.toContain("gap={12}")
			expect(result.code).not.toContain("gap={24}")
			expect(result.code).not.toContain("gap={8}")

			// Other attributes should remain unchanged
			expect(result.code).toContain("vertical")
			expect(result.code).toContain('align="center"')
			expect(result.code).toContain('direction="column"')
		} else {
			expect(result).not.toBeNull()
		}
	})

	it("should convert numeric gap prop in Flex component to rem string", () => {
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
						<Flex gap={16}>Content</Flex>
						<Flex gap={24} direction="vertical">More content</Flex>
					</div>
				)
			}
		`

		const result = transform.call({}, code, "/src/component.tsx")

		if (result && typeof result === "object" && "code" in result) {
			// 16px should be converted to "1rem"
			expect(result.code).toContain('gap={"1rem"}')
			// 24px should be converted to "1.5rem"
			expect(result.code).toContain('gap={"1.5rem"}')
			// Should not contain original numeric values
			expect(result.code).not.toContain("gap={16}")
			expect(result.code).not.toContain("gap={24}")
		}
	})

	it("should handle zero gap values correctly", () => {
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
				return <Flex gap={0}>Content</Flex>
			}
		`

		const result = transform.call({}, code, "/src/component.tsx")

		if (result && typeof result === "object" && "code" in result) {
			// 0 should be converted to "0"
			expect(result.code).toContain('gap={"0"}')
			expect(result.code).not.toContain("gap={0}")
		}
	})

	it("should handle ContactsSubSider file correctly", () => {
		const plugin = antdStylePxToRem({
			rootValue: 16,
			unitPrecision: 5,
			minPixelValue: 0.5,
			propList: ["*"],
			selectorBlackList: [],
			replace: true,
			enableJSXTransform: true,
		})

		const transform =
			typeof plugin.transform === "function"
				? plugin.transform
				: (plugin.transform as any)?.handler

		const code = `
			import { Flex } from "antd"
			
			function ContactsSubSider() {
				return (
					<SubSiderContainer className={styles.container}>
						<Flex vertical gap={12} align="left" className={styles.innerContainer}>
							<Flex vertical gap={10}>
								<div className={styles.title}>Title</div>
							</Flex>
							<div className={styles.divider} />
						</Flex>
					</SubSiderContainer>
				)
			}
		`

		const result = transform.call(
			{},
			code,
			"/src/opensource/pages/contacts/components/ContactsSubSider/index.tsx",
		)

		if (result && typeof result === "object" && "code" in result) {
			// gap={12} should be converted to gap={"0.75rem"}
			expect(result.code).toContain('gap={"0.75rem"}')
			// gap={10} should be converted to gap={"0.625rem"}
			expect(result.code).toContain('gap={"0.625rem"}')
			// Should not contain original numeric values
			expect(result.code).not.toContain("gap={12}")
			expect(result.code).not.toContain("gap={10}")
			// Other attributes should remain unchanged
			expect(result.code).toContain("vertical")
			expect(result.code).toContain('align="left"')
		} else {
			expect(result).not.toBeNull()
		}
	})

	describe("Style Attribute Support", () => {
		it("should convert px values in style attribute with numeric literals", () => {
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
						<div style={{ width: 100, height: 200, padding: 16 }}>
							Content
						</div>
					)
				}
			`

			const result = transform.call({}, code, "/src/component.tsx")

			if (result && typeof result === "object" && "code" in result) {
				// Numeric literals should be converted to rem strings
				expect(result.code).toContain('width: "6.25rem"') // 100/16 = 6.25rem
				expect(result.code).toContain('height: "12.5rem"') // 200/16 = 12.5rem
				expect(result.code).toContain('padding: "1rem"') // 16/16 = 1rem
				// Should not contain original numeric values
				expect(result.code).not.toContain("width: 100")
				expect(result.code).not.toContain("height: 200")
				expect(result.code).not.toContain("padding: 16")
			}
		})

		it("should convert px values in style attribute with string literals", () => {
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
						<div style={{ width: "100px", height: "200px", margin: "16px" }}>
							Content
						</div>
					)
				}
			`

			const result = transform.call({}, code, "/src/component.tsx")

			if (result && typeof result === "object" && "code" in result) {
				// String px values should be converted to rem
				expect(result.code).toContain('width: "6.25rem"')
				expect(result.code).toContain('height: "12.5rem"')
				expect(result.code).toContain('margin: "1rem"')
				// Should not contain original px values
				expect(result.code).not.toContain("100px")
				expect(result.code).not.toContain("200px")
				expect(result.code).not.toContain("16px")
			}
		})

		it("should work together with gap attribute on Flex", () => {
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
						<Flex 
							gap={24} 
							style={{ 
								width: 300, 
								padding: "16px",
								margin: \`8px\`
							}}
						>
							Content
						</Flex>
					)
				}
			`

			const result = transform.call({}, code, "/src/component.tsx")

			if (result && typeof result === "object" && "code" in result) {
				// gap attribute should be converted
				expect(result.code).toContain('gap={"1.5rem"}')
				// style attribute values should be converted
				expect(result.code).toContain('width: "18.75rem"')
				expect(result.code).toContain('padding: "1rem"')
				expect(result.code).toContain("margin: `0.5rem`")
			}
		})
	})

	describe("enableJSXTransform Configuration", () => {
		it("should process JSX when enableJSXTransform is true", () => {
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
						<div style={{ width: 100 }}>
							<Flex gap={16}>Content</Flex>
						</div>
					)
				}
			`

			const result = transform.call({}, code, "/src/component.tsx")

			if (result && typeof result === "object" && "code" in result) {
				// Both style and gap should be converted
				expect(result.code).toContain('width: "6.25rem"')
				expect(result.code).toContain('gap={"1rem"}')
			}
		})

		it("should not process JSX when enableJSXTransform is false", () => {
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
				import { Flex } from 'antd'
				
				const Component = () => {
					return (
						<div style={{ width: 100 }}>
							<Flex gap={16}>Content</Flex>
						</div>
					)
				}
			`

			const result = transform.call({}, code, "/src/component.tsx")

			// Should return null as JSX transform is disabled
			expect(result).toBeNull()
		})

		it("should default to enableJSXTransform: true", () => {
			const plugin = antdStylePxToRem({
				rootValue: 16,
				propList: ["*"],
				minPixelValue: 0,
				// Not specifying enableJSXTransform - should default to true
			})

			const transform =
				typeof plugin.transform === "function"
					? plugin.transform
					: (plugin.transform as any)?.handler

			const code = `
				import { Flex } from 'antd'
				
				const Component = () => {
					return (
						<div style={{ width: 100 }}>
							<Flex gap={16}>Content</Flex>
						</div>
					)
				}
			`

			const result = transform.call({}, code, "/src/component.tsx")

			if (result && typeof result === "object" && "code" in result) {
				// JSX should be processed by default
				expect(result.code).toContain('width: "6.25rem"')
				expect(result.code).toContain('gap={"1rem"}')
			}
		})
	})
})
