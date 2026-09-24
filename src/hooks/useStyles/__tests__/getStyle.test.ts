import { getStyle } from '../getStyle'
import type { SharedConfig } from '../useStyles'
import type { SiteThemeConfig } from '@/lib/theme'

const theme = { prefix: 'ink', prefixSelector: (name: string) => `.ink-${ name }` } as unknown as SiteThemeConfig

const baseArgs = {
	check: { isRoot: true, isUnstyled: false },
	classes: undefined,
	name: 'Button',
	prefix: 'ink',
	props: {},
	selector: 'root',
	theme,
} as unknown as SharedConfig<object>

describe('getStyle', () => {
	it('returns an empty object when tokens is undefined', () => {
		expect(getStyle({ ...baseArgs, tokens: undefined })).toEqual({})
	})

	it('returns an empty object when tokens is not a function', () => {
		expect(getStyle({ ...baseArgs, tokens: {} as any })).toEqual({})
	})

	it('returns an empty object when the tokens function has no entry for the current selector', () => {
		const tokens = jest.fn(() => ({ other: { color: 'red' } }))

		expect(getStyle({ ...baseArgs, selector: 'root', tokens })).toEqual({})
	})

	it('returns the CSS custom properties declared for the current selector', () => {
		const tokens = jest.fn(() => ({
			root: { '--button-background': 'blue', '--button-color': 'white' },
		}))

		expect(getStyle({ ...baseArgs, selector: 'root', tokens })).toEqual({
			'--button-background': 'blue',
			'--button-color': 'white',
		})
	})

	it('resolves a different selector key independently (e.g. "icon" vs "root")', () => {
		const tokens = jest.fn(() => ({
			icon: { '--button-icon-size': '1rem' },
			root: { '--button-background': 'blue' },
		}))

		expect(getStyle({ ...baseArgs, selector: 'icon', tokens })).toEqual({
			'--button-icon-size': '1rem',
		})
	})

	it('returns an empty object when the resolved value for the selector is not an object (e.g. a string)', () => {
		const tokens = jest.fn(() => ({ root: 'not-an-object' as any }))

		expect(getStyle({ ...baseArgs, selector: 'root', tokens })).toEqual({})
	})

	it('returns an empty object when the resolved value for the selector is null', () => {
		const tokens = jest.fn(() => ({ root: null as any }))

		expect(getStyle({ ...baseArgs, selector: 'root', tokens })).toEqual({})
	})

	it('treats an empty-object value for the selector as present and returns it as-is', () => {
		const tokens = jest.fn(() => ({ root: {} }))

		expect(getStyle({ ...baseArgs, selector: 'root', tokens })).toEqual({})
	})

	it('invokes tokens with (theme, props, a fresh context object) on every call', () => {
		const tokens = jest.fn((_theme: unknown, _props: unknown, _ctx: unknown) => ({ root: { '--x': '1' } }))
		const props = { size: 'lg' }

		getStyle({ ...baseArgs, props, selector: 'root', tokens })

		expect(tokens).toHaveBeenCalledTimes(1)
		const [calledTheme, calledProps, calledCtx] = tokens.mock.calls[0]
		expect(calledTheme).toBe(theme)
		expect(calledProps).toBe(props)
		expect(calledCtx).toEqual({})
	})

	it('passes a distinct context object to each independent call (not shared/mutated across calls)', () => {
		const seenContexts: object[] = []
		const tokens = jest.fn((_theme, _props, ctx) => {
			seenContexts.push(ctx)
			return { root: { '--x': '1' } }
		})

		getStyle({ ...baseArgs, selector: 'root', tokens })
		getStyle({ ...baseArgs, selector: 'root', tokens })

		expect(seenContexts).toHaveLength(2)
		expect(seenContexts[0]).not.toBe(seenContexts[1])
	})
})
