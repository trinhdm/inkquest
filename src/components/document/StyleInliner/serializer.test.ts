import { serializeStyles } from './serializer'
import type { CssRule } from '@/lib/theme'

describe('serializeStyles', () => {
	it('returns an empty string for an empty rule list', () => {
		expect(serializeStyles([])).toBe('')
	})

	it('serializes a single rule with indentation by default', () => {
		const rules: CssRule[] = [
			{ selector: ':root', vars: { '--color': 'red' } },
		]

		expect(serializeStyles(rules)).toBe(':root {\n\t--color: red;\n}')
	})

	it('joins multiple declarations within a rule, one per line, when indented', () => {
		const rules: CssRule[] = [
			{ selector: ':root', vars: { '--a': '1', '--b': '2' } },
		]

		expect(serializeStyles(rules)).toBe(':root {\n\t--a: 1;\n\t--b: 2;\n}')
	})

	it('joins multiple rules with a blank line between them when indented', () => {
		const rules: CssRule[] = [
			{ selector: ':root', vars: { '--a': '1' } },
			{ selector: '[data-inkq-scheme="light"]', vars: { '--a': '2' } },
		]

		expect(serializeStyles(rules)).toBe(
			':root {\n\t--a: 1;\n}\n\n[data-inkq-scheme="light"] {\n\t--a: 2;\n}'
		)
	})

	it('collapses to a single-line, space-separated form when hasIndent is false', () => {
		const rules: CssRule[] = [
			{ selector: ':root', vars: { '--a': '1', '--b': '2' } },
		]

		expect(serializeStyles(rules, false)).toBe(':root { --a: 1; --b: 2; }')
	})

	it('joins multiple minified rules with a single space, no blank lines', () => {
		const rules: CssRule[] = [
			{ selector: ':root', vars: { '--a': '1' } },
			{ selector: '.b', vars: { '--b': '2' } },
		]

		expect(serializeStyles(rules, false)).toBe(':root { --a: 1; } .b { --b: 2; }')
	})

	it('renders a rule with no declarations as an empty block', () => {
		const rules: CssRule[] = [{ selector: ':root', vars: {} }]

		expect(serializeStyles(rules)).toBe(':root {\n\n}')
		expect(serializeStyles(rules, false)).toBe(':root {  }')
	})

	it('stringifies non-string values in the declaration', () => {
		const rules: CssRule[] = [
			{ selector: ':root', vars: { '--count': 3 as unknown as string } },
		]

		expect(serializeStyles(rules)).toBe(':root {\n\t--count: 3;\n}')
	})
})
