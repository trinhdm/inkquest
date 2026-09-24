import type { SiteTheme } from '../types'

// `./tokens` (tokens/tokens.ts) aggregates the large, designer-tunable
// color/typography/motion/etc. token datasets. buildSchemes.ts's own job is
// orchestration — merge primitives + static tokens + one entry per color
// scheme — so we mock `./tokens` down to a handful of marker values and
// exercise buildSchemes' real composition against those, plus the real
// (small, deterministic) tokenGenerator and THEME_CONFIGS.
jest.mock('../tokens', () => ({
	Tokens: {
		accent: jest.fn((config: { scheme: string }) => ({ primary: `accent-${config.scheme}` })),
		background: jest.fn((config: { scheme: string }) => ({ page: `bg-${config.scheme}` })),
		border: {
			color: jest.fn((config: { scheme: string }) => ({ default: `border-${config.scheme}` })),
			radius: jest.fn(() => ({ sm: '4px' })),
		},
		color: jest.fn((config: { scheme: string }) => ({ text: `color-${config.scheme}` })),
		typography: jest.fn(() => ({ font: { family: 'Test Sans' } })),
		space: jest.fn(() => ({ sm: '4px' })),
		breakpoint: jest.fn(() => ({ sm: '600px' })),
		container: jest.fn(() => ({ sm: '1040px' })),
		opacity: jest.fn(() => ({ disabled: '0.5' })),
		padding: jest.fn(() => ({ sm: '4px' })),
		motion: jest.fn(() => ({ fast: '.2s' })),
		layout: jest.fn(() => ({ grid: { columns: '12' } })),
		element: jest.fn(() => ({ header: { height: '64px' } })),
	},
}))

// Imported after the mock so buildSchemes picks up the mocked `./tokens`.
import { buildSchemes } from '../buildSchemes'

beforeAll(() => {
	document.documentElement.style.fontSize = '16px'
})

afterAll(() => {
	document.documentElement.style.fontSize = ''
})

// A minimal, hand-built SiteTheme fixture. SiteTheme's scale fields
// (fontSize, opacity, radius, etc.) are deliberately open-ended arrays with
// no fixed length (see scales.ts's header comment), so a single-element
// array per field is a legitimately valid SiteTheme, not a coincidentally
// working shortcut.
const fixtureTheme = {
	scale: { space: 4 },
	colors: {
		ink: ['#000000'],
		oxblood: ['#e8483f'],
		ghost: ['#f2f0ec'],
		paper: ['#ffffff'],
		crimson: ['#b02b27'],
		smoke: ['#777570'],
		red: '#ff0000',
		green: '#00ff00',
		yellow: '#ffff00',
		blue: '#0000ff',
		white: '#ffffff',
		gray: '#808080',
		black: '#000000',
	},
	fontFamily: { black: 'A', sans: 'B', mono: 'C' },
	fontSize: [16],
	fontWeight: [400],
	lineHeight: { normal: 1.5 },
	letterSpacing: ['0em'],
	duration: { default: '.3s' },
	easing: { base: 'ease' },
	opacity: [1],
	radius: [0],
	screenSize: [320],
} as SiteTheme

describe('buildSchemes', () => {
	it('returns a "base" scheme plus one entry per THEME_CONFIGS color scheme (dark/light)', () => {
		const result = buildSchemes(fixtureTheme, 'inkq')
		expect(Object.keys(result).sort()).toEqual(['base', 'dark', 'light'])
	})

	it('builds "base" from the theme\'s own colors, unprefixed, alongside the mocked static tokens (prefixed)', () => {
		const result = buildSchemes(fixtureTheme, 'inkq')

		// theme.colors flow straight through tokenGenerator() with NO prefix
		expect(result.base['--ink-100']).toBe('#000000')
		expect(result.base['--red-100']).toBe('#ff0000')

		// the static Tokens.* mocks flow through tokenGenerator() WITH the prefix
		expect(result.base['--inkq-font-family']).toBe('Test Sans')
		expect(result.base['--inkq-border-radius-sm']).toBe('4px')
		expect(result.base['--inkq-grid-columns']).toBe('12') // from Tokens.layout()'s spread
		expect(result.base['--inkq-header-height']).toBe('64px') // from Tokens.element()'s spread
	})

	it('builds "base" from the rest of the theme (non-color fields) via the same unprefixed primitive path', () => {
		const result = buildSchemes(fixtureTheme, 'inkq')
		expect(result.base['--font-family-black']).toBe('A')
		expect(result.base['--duration-default']).toBe('.3s')
	})

	it('builds each per-scheme entry from Tokens.accent/color/background/border.color, called with that scheme\'s ThemeConfig', () => {
		const result = buildSchemes(fixtureTheme, 'inkq')

		expect(result.dark).toEqual({
			'--inkq-theme': 'ink',
			'--inkq-accent-primary': 'accent-dark',
			'--inkq-color-text': 'color-dark',
			'--inkq-background-page': 'bg-dark',
			'--inkq-border-default': 'border-dark',
		})

		expect(result.light).toEqual({
			'--inkq-theme': 'paper',
			'--inkq-accent-primary': 'accent-light',
			'--inkq-color-text': 'color-light',
			'--inkq-background-page': 'bg-light',
			'--inkq-border-default': 'border-light',
		})
	})

	it('passes the ThemeConfig for each scheme, not the raw scheme key, to the per-scheme token functions', () => {
		const { Tokens } = jest.requireMock('../tokens') as {
			Tokens: { accent: jest.Mock }
		}

		buildSchemes(fixtureTheme, 'inkq')

		expect(Tokens.accent).toHaveBeenCalledWith({ name: 'ink', scheme: 'dark' })
		expect(Tokens.accent).toHaveBeenCalledWith({ name: 'paper', scheme: 'light' })
	})

	it('works with no prefix at all, leaving static/per-scheme token names unprefixed', () => {
		const result = buildSchemes(fixtureTheme)
		expect(result.base['--font-family']).toBe('Test Sans')
		expect(result.dark['--theme']).toBe('ink')
	})
})
