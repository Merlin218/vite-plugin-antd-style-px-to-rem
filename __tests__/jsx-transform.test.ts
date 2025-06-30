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
			jsxAttributeMapping: { "Flex": ["gap"] },
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
			jsxAttributeMapping: { "Flex": ["gap"] },
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
			jsxAttributeMapping: { "Flex": ["gap"] },
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
			jsxAttributeMapping: { "Flex": ["gap"] },
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
			jsxAttributeMapping: { "Flex": ["gap"] },
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
				jsxAttributeMapping: { "Flex": ["gap"] },
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
				jsxAttributeMapping: { "Flex": ["gap"] },
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
				jsxAttributeMapping: { "Flex": ["gap"] },
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

	describe("jsxAttributeMapping Configuration", () => {
		it("should not transform any JSX attributes when jsxAttributeMapping is empty", () => {
			const plugin = antdStylePxToRem({
				rootValue: 16,
				propList: ["*"],
				minPixelValue: 0,
				enableJSXTransform: true,
				jsxAttributeMapping: {},
			})

			const transform =
				typeof plugin.transform === "function"
					? plugin.transform
					: (plugin.transform as any)?.handler

			const code = `
				import { Flex, Button } from 'antd'
				
				const Component = () => {
					return (
						<div>
							<Flex gap={16}>
								<Button size={24}>Click me</Button>
							</Flex>
						</div>
					)
				}
			`

			const result = transform.call({}, code, "/src/component.tsx")

			if (result && typeof result === "object" && "code" in result) {
				// gap and size should NOT be converted
				expect(result.code).toContain("gap={16}")
				expect(result.code).toContain("size={24}")
				expect(result.code).not.toContain('gap={"1rem"}')
				expect(result.code).not.toContain('size={"1.5rem"}')
			} else {
				// Should return null if no style attributes to convert
				expect(result).toBeNull()
			}
		})

		it("should transform only configured component attributes", () => {
			const plugin = antdStylePxToRem({
				rootValue: 16,
				propList: ["*"],
				minPixelValue: 0,
				enableJSXTransform: true,
				jsxAttributeMapping: {
					"Flex": ["gap"],
					"Button": ["size"]
				},
			})

			const transform =
				typeof plugin.transform === "function"
					? plugin.transform
					: (plugin.transform as any)?.handler

			const code = `
				import { Flex, Button, Input } from 'antd'
				
				const Component = () => {
					return (
						<div>
							<Flex gap={16} padding={20}>
								<Button size={24} margin={12}>Click me</Button>
								<Input width={200} height={40} />
							</Flex>
						</div>
					)
				}
			`

			const result = transform.call({}, code, "/src/component.tsx")

			if (result && typeof result === "object" && "code" in result) {
				// Only configured attributes should be converted
				expect(result.code).toContain('gap={"1rem"}') // Flex.gap configured
				expect(result.code).toContain('size={"1.5rem"}') // Button.size configured
				
				// Non-configured attributes should remain unchanged
				expect(result.code).toContain("padding={20}") // Flex.padding not configured
				expect(result.code).toContain("margin={12}") // Button.margin not configured
				expect(result.code).toContain("width={200}") // Input.width not configured
				expect(result.code).toContain("height={40}") // Input.height not configured
			}
		})

		it("should support multiple attributes for the same component", () => {
			const plugin = antdStylePxToRem({
				rootValue: 16,
				propList: ["*"],
				minPixelValue: 0,
				enableJSXTransform: true,
				jsxAttributeMapping: {
					"Flex": ["gap", "padding", "margin"]
				},
			})

			const transform =
				typeof plugin.transform === "function"
					? plugin.transform
					: (plugin.transform as any)?.handler

			const code = `
				import { Flex } from 'antd'
				
				const Component = () => {
					return (
						<Flex gap={16} padding={20} margin={24} width={300}>
							Content
						</Flex>
					)
				}
			`

			const result = transform.call({}, code, "/src/component.tsx")

			if (result && typeof result === "object" && "code" in result) {
				// All configured attributes should be converted
				expect(result.code).toContain('gap={"1rem"}')
				expect(result.code).toContain('padding={"1.25rem"}')
				expect(result.code).toContain('margin={"1.5rem"}')
				
				// Non-configured attributes should remain unchanged
				expect(result.code).toContain("width={300}")
			}
		})

		it("should handle mixed component types with different attribute mappings", () => {
			const plugin = antdStylePxToRem({
				rootValue: 16,
				propList: ["*"],
				minPixelValue: 0,
				enableJSXTransform: true,
				jsxAttributeMapping: {
					"Flex": ["gap"],
					"Button": ["size", "padding"],
					"Input": ["width", "height"]
				},
			})

			const transform =
				typeof plugin.transform === "function"
					? plugin.transform
					: (plugin.transform as any)?.handler

			const code = `
				import { Flex, Button, Input, Card } from 'antd'
				
				const Component = () => {
					return (
						<div>
							<Flex gap={16} margin={20}>
								<Button size={24} padding={8} margin={4}>Button</Button>
								<Input width={200} height={40} padding={12} />
								<Card width={300} height={200} />
							</Flex>
						</div>
					)
				}
			`

			const result = transform.call({}, code, "/src/component.tsx")

			if (result && typeof result === "object" && "code" in result) {
				// Flex configured attributes
				expect(result.code).toContain('gap={"1rem"}') // configured
				expect(result.code).toContain("margin={20}") // not configured
				
				// Button configured attributes
				expect(result.code).toContain('size={"1.5rem"}') // configured
				expect(result.code).toContain('padding={"0.5rem"}') // configured
				expect(result.code).toContain("margin={4}") // not configured
				
				// Input configured attributes
				expect(result.code).toContain('width={"12.5rem"}') // configured
				expect(result.code).toContain('height={"2.5rem"}') // configured
				expect(result.code).toContain("padding={12}") // not configured
				
				// Card not configured at all
				expect(result.code).toContain("width={300}") // Card.width not configured
				expect(result.code).toContain("height={200}") // Card.height not configured
			}
		})

		it("should respect minPixelValue for jsxAttributeMapping", () => {
			const plugin = antdStylePxToRem({
				rootValue: 16,
				propList: ["*"],
				minPixelValue: 10, // Only convert values >= 10px
				enableJSXTransform: true,
				jsxAttributeMapping: {
					"Flex": ["gap"]
				},
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
							<Flex gap={8}>Small gap</Flex>
							<Flex gap={16}>Large gap</Flex>
						</div>
					)
				}
			`

			const result = transform.call({}, code, "/src/component.tsx")

			if (result && typeof result === "object" && "code" in result) {
				// Only values >= minPixelValue should be converted
				expect(result.code).toContain("gap={8}") // < 10, not converted
				expect(result.code).toContain('gap={"1rem"}') // >= 10, converted
			}
		})

		it("should default to empty jsxAttributeMapping", () => {
			const plugin = antdStylePxToRem({
				rootValue: 16,
				propList: ["*"],
				minPixelValue: 0,
				enableJSXTransform: true,
				// Not specifying jsxAttributeMapping - should default to {}
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
				// style attribute should still be converted
				expect(result.code).toContain('width: "6.25rem"')
				// gap should NOT be converted (not in mapping)
				expect(result.code).toContain("gap={16}")
				expect(result.code).not.toContain('gap={"1rem"}')
			}
		})
	})
})
