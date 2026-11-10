import { getStyle } from '../getStyle'
import type { SharedConfig } from '../useStyles'
import type { SiteThemeConfig } from '@/lib/theme/types'
import type { CSSVariable } from '@/types/shared'

const theme = { prefix: 'ink', prefixSelector: (name: string) => `.ink-${ name }` } as unknown as SiteThemeConfig

interface TestSpecs {
	props: Record<string, unknown>
	selectors: 'root' | 'icon'
	tokens: Record<string, CSSVariable>
}

const baseArgs: SharedConfig<TestSpecs> = {
	check: { isRoot: true, isUnstyled: false },
	classes: undefined,
	name: 'Button',
	prefix: 'ink',
	props: {},
	selector: 'root',
	theme,
}

describe('getStyle', () => {
	it('returns an empty object when tokens is undefined', () => {
		expect(getStyle<TestSpecs>({ ...baseArgs, tokens: undefined })).toEqual({})
	})

	it('returns an empty object when tokens is not a function', () => {
		expect(getStyle<TestSpecs>({ ...baseArgs, tokens: {} as any })).toEqual({})
	})

	it('returns an empty object when the tokens function has no entry for the current selector', () => {
		const tokens = jest.fn(() => ({ other: { color: 'red' } }))

		expect(getStyle<TestSpecs>({ ...baseArgs, selector: 'root', tokens })).toEqual({})
	})

	it('returns the CSS custom properties declared for the current selector', () => {
		const tokens = jest.fn(() => ({
			root: { '--button-background': 'blue', '--button-color': 'white' },
		}))

		expect(getStyle<TestSpecs>({ ...baseArgs, selector: 'root', tokens })).toEqual({
			'--button-background': 'blue',
			'--button-color': 'white',
		})
	})

	it('resolves a different selector key independently (e.g. "icon" vs "root")', () => {
		const tokens = jest.fn(() => ({
			icon: { '--button-icon-size': '1rem' },
			root: { '--button-background': 'blue' },
		}))

		expect(getStyle<TestSpecs>({ ...baseArgs, selector: 'icon', tokens })).toEqual({
			'--button-icon-size': '1rem',
		})
	})

	it('returns an empty object when the resolved value for the selector is not an object (e.g. a string)', () => {
		const tokens = jest.fn(() => ({ root: 'not-an-object' as any }))

		expect(getStyle<TestSpecs>({ ...baseArgs, selector: 'root', tokens })).toEqual({})
	})

	it('returns an empty object when the resolved value for the selector is null', () => {
		const tokens = jest.fn(() => ({ root: null as any }))

		expect(getStyle<TestSpecs>({ ...baseArgs, selector: 'root', tokens })).toEqual({})
	})

	it('treats an empty-object value for the selector as present and returns it as-is', () => {
		const tokens = jest.fn(() => ({ root: {} }))

		expect(getStyle<TestSpecs>({ ...baseArgs, selector: 'root', tokens })).toEqual({})
	})

	it('returns inherited style and skips calling tokens entirely when unstyled', () => {
		const tokens = jest.fn(() => ({ root: { '--x': '1' } }))
		const props = { style: { color: 'red' } }

		expect(getStyle<TestSpecs>({
			...baseArgs,
			check: { isRoot: true, isUnstyled: true },
			props,
			tokens,
		})).toEqual({ color: 'red' })

		expect(tokens).not.toHaveBeenCalled()
	})

	it('invokes tokens with a single { context, props, theme } object', () => {
		const tokens = jest.fn(() => ({ root: { '--x': '1' } }))
		const props = { size: 'lg' }

		getStyle<TestSpecs>({ ...baseArgs, props, selector: 'root', tokens })

		expect(tokens).toHaveBeenCalledTimes(1)
		expect(tokens).toHaveBeenCalledWith({ context: undefined, props, theme })
	})

	it('passes a distinct wrapper object to each independent call (not shared/mutated across calls)', () => {
		const seenArgs: object[] = []
		const tokens = jest.fn((arg) => {
			seenArgs.push(arg)
			return { root: { '--x': '1' } }
		})

		getStyle<TestSpecs>({ ...baseArgs, selector: 'root', tokens })
		getStyle<TestSpecs>({ ...baseArgs, selector: 'root', tokens })

		expect(seenArgs).toHaveLength(2)
		expect(seenArgs[0]).not.toBe(seenArgs[1])
	})
})
