import { buildSchemes } from '../../buildSchemes'
import { Tokens } from '../tokens'
import { alias, tokens as apiTokens } from '../../reference'
import { THEME_CONFIGS } from '../../themeConfig'
import { tokenGenerator } from '../../generate'
import type { SiteTheme } from '../../types'

// Integration: every prefixed alias (`var(--inkq-…)`) that a token function
// emits must name a custom property the generator actually emits, otherwise
// the CSS silently falls through to `initial`.

const PREFIX = 'inkq'
const theme = { scale: { space: 4 }, colors: {} } as unknown as SiteTheme

const REF = /var\((--inkq-[\w-]+)\)/g
const refsIn = (value: unknown): string[] =>
	[...String(value).matchAll(REF)].map(m => m[1])

describe('token alias references', () => {
	let schemes: ReturnType<typeof buildSchemes>

	beforeAll(() => {
		document.documentElement.style.fontSize = '16px'
		schemes = buildSchemes(theme, PREFIX)
	})
	afterAll(() => {
		document.documentElement.style.fontSize = ''
	})

	it.each(['dark', 'light'] as const)('resolves every emitted alias on %s to an emitted property', (scheme) => {
		const emitted = { ...schemes.base, ...schemes[scheme] }
		const dangling: string[] = []

		for (const [name, value] of Object.entries(emitted))
			for (const ref of refsIn(value))
				if (!(ref in emitted)) dangling.push(`${name} -> ${ref}`)

		expect(dangling).toEqual([])
	})

	it('resolves every alias the component-facing API hands out', () => {
		const emitted = { ...schemes.base, ...schemes.dark }
		const calls: string[] = [
			apiTokens.presets.motion('box'),
			apiTokens.presets.motion('colors'),
			apiTokens.presets.text.h1(),
			apiTokens.presets.text.body(),
			apiTokens.presets.text.label(),
			apiTokens.presets.text.control(),
			apiTokens.presets.text.navigation(),
			apiTokens.presets.text.prose(),
			apiTokens.presets.text.eyebrow(),
			apiTokens.presets.text.caption(),
			apiTokens.el.field.padding('md'),
			apiTokens.el.icon.size('md'),
			apiTokens.padding('block'),
			apiTokens.space('grid'),
			apiTokens.space('grid', 'md'),
		]
		const missing = calls.flatMap(refsIn).filter(ref => !(ref in emitted))

		expect(missing).toEqual([])
	})

	it('emits scheme-specific accent values in the scheme maps only, not in base', () => {
		expect(schemes.dark['--inkq-accent']).toBeDefined()
		expect(schemes.base['--inkq-accent' as keyof typeof schemes.base]).toBeUndefined()
	})

	it('feeds the generator the same objects the Tokens table builds (sanity)', () => {
		const accent = tokenGenerator({ accent: Tokens.accent(THEME_CONFIGS.dark) }, PREFIX)
		expect(accent['--inkq-accent']).toBe(Tokens.accent(THEME_CONFIGS.dark).base)
		expect(alias.accent()).toBe('var(--inkq-accent)')
	})
})
