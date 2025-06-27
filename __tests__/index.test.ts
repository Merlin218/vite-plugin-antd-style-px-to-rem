import { describe, it, expect } from "vitest"

// Import all test suites
import "./plugin-config.test"
import "./transform-function.test"
import "./error-handling.test"
import "./css-processing.test"
import "./jsx-transform.test"
import "./configuration-options.test"
import "./edge-cases.test"
import "./conditional-expressions.test"
import "./ignore-comments.test"

describe("vite-plugin-antd-style-px-to-rem", () => {
	it("should run all split test suites", () => {
		// This test ensures the test runner doesn't complain about empty test suite
		// All actual tests are in the imported test files above
		expect(true).toBe(true)
	})
})
