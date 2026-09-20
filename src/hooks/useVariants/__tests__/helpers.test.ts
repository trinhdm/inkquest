import { deriveVariants } from '../helpers'
import { presets, tokens, type SiteThemeConfig } from '@/lib/theme'

// SiteThemeConfig extends SemanticTokens, so a hand-typed fixture would need
// to fake the entire accessor catalog. Since reference/semantic.ts is real,
// deterministic logic (not the large token dataset) and is already covered
// directly in reference/semantic.test.ts, we compose with it for real here
// and only add the fields deriveVariants actually reads — `presets` is a
// required field of `SiteThemeConfig` (`theme.types.ts`) even though
// `deriveVariants` itself never touches it.
const makeTheme = (options: { prefix?: string } = { prefix: 'inkq' }): SiteThemeConfig => {
	const { prefix } = options
	return {
		...tokens,
		presets,
		prefix,
		prefixSelector: (name: string) => `.${prefix}-${name}`,
	}
}

describe('deriveVariants', () => {
	it('builds one bridge var per default slot (background/border/color), each falling back through the theme prefix', () => {
		const rule = deriveVariants({ name: 'Button' }, makeTheme())

		expect(rule.vars['--button-background']).toBe('var(--variant-background, var(--inkq-background-backup))')
		expect(rule.vars['--button-border']).toBe('var(--variant-border, var(--inkq-border-backup))')
		expect(rule.vars['--button-color']).toBe('var(--variant-color, var(--inkq-color-backup))')
	})

	it('builds one bridge var per default state (hover) that falls back through the component\'s OWN base var, not the shared --variant-* var', () => {
		const rule = deriveVariants({ name: 'Button' }, makeTheme())

		expect(rule.vars['--button-background-hover']).toBe('var(--variant-background-hover, var(--button-background))')
	})

	it('only builds vars for explicitly requested slots and states', () => {
		const rule = deriveVariants({ name: 'Card', slots: ['border'], states: ['focus'] }, makeTheme())

		expect(Object.keys(rule.vars).sort()).toEqual(['--card-border', '--card-border-focus'])
		expect(rule.vars['--card-border-focus']).toBe('var(--variant-border-focus, var(--card-border))')
	})

	it('builds only the base slot var when states is explicitly empty (no hover bridge)', () => {
		const rule = deriveVariants({ name: 'Card', slots: ['color'], states: [] }, makeTheme())

		expect(Object.keys(rule.vars)).toEqual(['--card-color'])
	})

	it('kebab-cases a multi-word component name for the variable namespace', () => {
		const rule = deriveVariants({ name: 'MenuItem', slots: ['color'] }, makeTheme())

		expect(rule.vars['--menu-item-color']).toBeDefined()
	})

	it('derives its selector from theme.prefixSelector(name), not from the namespace directly', () => {
		const theme = makeTheme({ prefix: 'inkq' })
		const rule = deriveVariants({ name: 'Button' }, theme)

		expect(rule.selector).toBe(theme.prefixSelector('Button'))
		expect(rule.selector).toBe('.inkq-Button')
	})

	it('reads the fallback backup var from theme.prefix, so an unprefixed theme produces an unprefixed backup', () => {
		const theme = makeTheme({ prefix: undefined })
		const rule = deriveVariants({ name: 'Button', slots: ['color'] }, theme)

		expect(rule.vars['--button-color']).toBe('var(--variant-color, var(--undefined-color-backup))')
	})
})
