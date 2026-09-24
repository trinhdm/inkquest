import { buildSchemes } from '@/lib/theme'
import { resolveStyles, standardizeRules } from './resolver'
import { SCHEME_STORAGE_KEY } from '../constants'
import type { SiteTheme, ThemeTokens } from '@/lib/theme'

jest.mock('@/lib/theme', () => ({
	...jest.requireActual('@/lib/theme'),
	buildSchemes: jest.fn(),
}))

const mockBuildSchemes = buildSchemes as jest.Mock

describe('standardizeRules', () => {
	it('returns an empty array when every scheme is empty', () => {
		const tokens = { base: {}, light: {}, dark: {} } as ThemeTokens

		expect(standardizeRules(tokens)).toEqual([])
	})

	it('drops schemes with no vars but keeps schemes with vars', () => {
		const tokens = {
			base: { '--a': '1' },
			light: {},
			dark: { '--a': '2' },
		} as unknown as ThemeTokens

		const rules = standardizeRules(tokens)
		const selectors = rules.map(r => r.selector)

		expect(rules).toHaveLength(2)
		expect(selectors.some(s => !s.includes('data-'))).toBe(true) // base has no attr selector
		expect(selectors.some(s => s.includes(`data-${ SCHEME_STORAGE_KEY }="dark"`))).toBe(true)
	})

	it('uses the default :root, :host selector when no custom selector is given', () => {
		const tokens = { base: { '--a': '1' } } as unknown as ThemeTokens

		expect(standardizeRules(tokens)[0].selector).toBe(':root, :host')
	})

	it('does not append a scheme attribute selector for the base scheme', () => {
		const tokens = { base: { '--a': '1' } } as unknown as ThemeTokens

		expect(standardizeRules(tokens)[0].selector).not.toContain('data-')
	})

	it('appends a data-<lsKey>="<scheme>" attribute selector to each comma-separated base selector', () => {
		const tokens = { light: { '--a': '1' } } as unknown as ThemeTokens

		// BASE_SELECTORS is ':root, :host' — the attribute is appended to each
		// half individually, not to the group as a whole.
		expect(standardizeRules(tokens)[0].selector).toBe(
			`:root[data-${ SCHEME_STORAGE_KEY }="light"], :host[data-${ SCHEME_STORAGE_KEY }="light"]`
		)
	})

	it('applies a custom selector, splitting and trimming on commas', () => {
		const tokens = { light: { '--a': '1' } } as unknown as ThemeTokens

		expect(standardizeRules(tokens, ' .a , .b ')[0].selector).toBe(
			`.a[data-${ SCHEME_STORAGE_KEY }="light"], .b[data-${ SCHEME_STORAGE_KEY }="light"]`
		)
	})

	it('preserves the vars object on the resulting rule untouched', () => {
		const tokens = { base: { '--a': '1', '--b': '2' } } as unknown as ThemeTokens

		expect(standardizeRules(tokens)[0].vars).toEqual({ '--a': '1', '--b': '2' })
	})
})

describe('resolveStyles', () => {
	afterEach(() => {
		mockBuildSchemes.mockReset()
	})

	it('builds schemes from the current theme alone when no override is given', () => {
		mockBuildSchemes.mockReturnValue({ base: { '--a': '1' } })

		const theme = {} as SiteTheme
		const rules = resolveStyles({ current: theme })

		expect(mockBuildSchemes).toHaveBeenCalledTimes(1)
		expect(mockBuildSchemes).toHaveBeenCalledWith(theme, undefined)
		expect(rules).toEqual([{ selector: ':root, :host', vars: { '--a': '1' } }])
	})

	it('passes the prefix through to buildSchemes', () => {
		mockBuildSchemes.mockReturnValue({ base: {} })

		resolveStyles({ current: {} as SiteTheme, prefix: 'inkq' })

		expect(mockBuildSchemes).toHaveBeenCalledWith({}, 'inkq')
	})

	it('deep-merges override vars on top of current vars per-scheme', () => {
		mockBuildSchemes
			.mockReturnValueOnce({ base: { '--a': '1', '--b': '1' } })
			.mockReturnValueOnce({ base: { '--b': '2' } })

		const rules = resolveStyles({ current: {} as SiteTheme, override: {} as SiteTheme })

		expect(mockBuildSchemes).toHaveBeenCalledTimes(2)
		expect(rules).toEqual([{ selector: ':root, :host', vars: { '--a': '1', '--b': '2' } }])
	})

	it('produces no rules when the current theme resolves to entirely empty schemes', () => {
		mockBuildSchemes.mockReturnValue({ base: {}, light: {}, dark: {} })

		expect(resolveStyles({ current: {} as SiteTheme })).toEqual([])
	})
})
