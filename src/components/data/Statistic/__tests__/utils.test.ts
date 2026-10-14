import { getSharedTokens } from '../utils'
import { tokens } from '@/lib/theme/reference'
import type { SiteThemeConfig } from '@/lib/theme/types'

type RootArgs = Parameters<ReturnType<typeof getSharedTokens<'root'>>>[0]
type GroupArgs = Parameters<ReturnType<typeof getSharedTokens<'group'>>>[0]

// The callback reads theme.presets, theme.fontSize, theme.el.icon, theme.space
// and theme.padding, so use the real token catalog (as deriveVariants.test.ts
// does) and compute expected values from the same accessors.
const theme = {
	...tokens,
	prefix: 'inkq',
	prefixSelector: (name: string) => `.inkq-${name}`,
} as unknown as SiteThemeConfig

// A grouped Statistic has a Statistic.Group context (what `useSafeRootCtx`
// returns, including `rootName`); a standalone one has `null`. Its values
// deliberately differ from the item props used below.
const groupValues = { order: 'ascend', size: 'sm' } as const
const groupContext = {
	...groupValues,
	rootName: 'Statistic.Group',
} as unknown as NonNullable<RootArgs['context']>

// `value` is required on the real props but never read by the tokens.
const asRootProps = (props: Partial<RootArgs['props']>) => props as RootArgs['props']
const asGroupProps = (props: Partial<GroupArgs['props']>) => props as GroupArgs['props']

const rootTokens = (props: Partial<RootArgs['props']>, context: RootArgs['context'] = null) =>
	getSharedTokens('root')({ context, props: asRootProps(props), theme })

const groupTokens = (props: Partial<GroupArgs['props']>, context?: GroupArgs['context']) =>
	getSharedTokens('group')({ context, props: asGroupProps(props), theme })

describe('getSharedTokens', () => {
	describe('deriving tokens from props (standalone Statistic)', () => {
		it('returns three groups -- root, inner and caption -- with exactly the declared keys', () => {
			const result = rootTokens({ order: 'descend', size: 'lg' })

			expect(Object.keys(result)).toEqual(['root', 'inner', 'caption'])
			expect(Object.keys(result.root!)).toEqual(['--stat-align', '--stat-direction', '--stat-row-gap'])
			expect(Object.keys(result.inner!)).toEqual(['--stat-font-size', '--stat-icon-margin', '--stat-icon-size'])
			expect(Object.keys(result.caption!)).toEqual(['--stat-font-caption'])
		})

		it('order="descend" aligns to the start in a normal column', () => {
			const { root } = rootTokens({ order: 'descend' })

			expect(root!['--stat-align']).toBe('start')
			expect(root!['--stat-direction']).toBe('column')
		})

		it('order="ascend" aligns to the end in a reversed column', () => {
			const { root } = rootTokens({ order: 'ascend' })

			expect(root!['--stat-align']).toBe('end')
			expect(root!['--stat-direction']).toBe('column-reverse')
		})

		it('leaves align and direction undefined when no order is given, but still emits them as keys', () => {
			const { root } = rootTokens({ size: 'lg' })

			expect(root).toHaveProperty('--stat-align', undefined)
			expect(root).toHaveProperty('--stat-direction', undefined)
		})

		it('derives the large-size tokens from the theme for size="lg"', () => {
			const icon = theme.el.icon.size('sm'),
				spacer = theme.space('icon')
			const result = rootTokens({ size: 'lg' })

			expect(result.inner).toEqual({
				'--stat-font-size': theme.fontSize('h3'),
				'--stat-icon-margin': `calc(2 * ${spacer})`,
				'--stat-icon-size': `calc(2 * ${icon})`,
			})
			expect(result.root!['--stat-row-gap']).toBe(spacer)
			expect(result.caption).toEqual({ '--stat-font-caption': theme.presets.text.caption('item') })
		})

		it('derives the smaller-size tokens from the theme for a non-lg size', () => {
			const icon = theme.el.icon.size('sm'),
				spacer = theme.space('icon')
			const result = rootTokens({ size: 'sm' })

			expect(result.inner).toEqual({
				'--stat-font-size': theme.fontSize('h4'),
				'--stat-icon-margin': spacer,
				'--stat-icon-size': icon,
			})
			expect(result.root!['--stat-row-gap']).toBe(theme.padding('menu'))
			expect(result.caption).toEqual({ '--stat-font-caption': theme.presets.text.section('eyebrow') })
		})

		it('gives different values for lg than for a non-lg size', () => {
			const lg = rootTokens({ size: 'lg' }),
				sm = rootTokens({ size: 'sm' })

			expect(lg.inner!['--stat-font-size']).not.toBe(sm.inner!['--stat-font-size'])
			expect(lg.inner!['--stat-icon-margin']).not.toBe(sm.inner!['--stat-icon-margin'])
			expect(lg.inner!['--stat-icon-size']).not.toBe(sm.inner!['--stat-icon-size'])
			expect(lg.caption!['--stat-font-caption']).not.toEqual(sm.caption!['--stat-font-caption'])
		})

		it('leaves every size token undefined when no size is given', () => {
			const result = rootTokens({ order: 'descend' })

			expect(result.root!['--stat-row-gap']).toBeUndefined()
			expect(Object.values(result.inner!).every(value => value === undefined)).toBe(true)
			expect(Object.values(result.caption!).every(value => value === undefined)).toBe(true)
			// positive control: the same call does produce values once size is given
			expect(rootTokens({ order: 'descend', size: 'lg' }).inner!['--stat-font-size']).toEqual(expect.any(String))
		})

		it('derives order and size independently of each other', () => {
			const both = rootTokens({ order: 'ascend', size: 'lg' }),
				orderOnly = rootTokens({ order: 'ascend' }),
				sizeOnly = rootTokens({ size: 'lg' })

			expect(both.root).toEqual({
				'--stat-align': orderOnly.root!['--stat-align'],
				'--stat-direction': orderOnly.root!['--stat-direction'],
				'--stat-row-gap': sizeOnly.root!['--stat-row-gap'],
			})
			expect(both.inner).toEqual(sizeOnly.inner)
			expect(both.caption).toEqual(sizeOnly.caption)
		})
	})

	describe('a group\'s values always win', () => {
		it('behaves like "root" when called with no argument', () => {
			const props = { order: 'descend', size: 'lg' } as const

			expect(getSharedTokens()({ context: null, props: asRootProps(props), theme }))
				.toEqual(rootTokens(props))
			expect(getSharedTokens()({ context: groupContext, props: asRootProps(props), theme }))
				.toEqual({})
		})

		it('"root" with a group context returns {} so the group\'s tokens apply by inheritance', () => {
			expect(rootTokens({ order: 'descend', size: 'lg' }, groupContext)).toEqual({})
		})

		it('"root" with a group context returns {} even when its own size and order differ from the group\'s', () => {
			const props = { order: 'descend', size: 'lg' } as const

			// positive control: the same props do produce tokens when standalone,
			// and they differ from the tokens the group's own values produce
			expect(rootTokens(props).inner!['--stat-font-size']).toEqual(expect.any(String))
			expect(rootTokens(props)).not.toEqual(rootTokens(groupValues))
			// inside the group, they are ignored
			expect(rootTokens(props, groupContext)).toEqual({})
		})

		it('"group" returns a single `root` group', () => {
			expect(Object.keys(groupTokens({ order: 'descend', size: 'lg' }))).toEqual(['root'])
		})

		it('"group" holds every token: its values equal the standalone root + inner + caption values', () => {
			const props = { order: 'ascend', size: 'sm' } as const
			const standalone = rootTokens(props)
			const result = groupTokens(props)

			expect(result.root).toEqual({ ...standalone.root, ...standalone.inner, ...standalone.caption })
			expect(Object.keys(result.root!).sort()).toEqual([
				'--stat-align',
				'--stat-direction',
				'--stat-font-caption',
				'--stat-font-size',
				'--stat-icon-margin',
				'--stat-icon-size',
				'--stat-row-gap',
			])
			expect(result.root!['--stat-align']).toBe('end')
		})

		it('"group" returns the same tokens with or without a context', () => {
			const props = { order: 'descend', size: 'lg' } as const
			const without = groupTokens(props)

			expect(without.root!['--stat-font-size']).toEqual(expect.any(String))
			expect(groupTokens(props, groupContext as unknown as GroupArgs['context'])).toEqual(without)
		})
	})

	describe('caching', () => {
		it('does not cache between calls: one token function gives different results for different props', () => {
			const fn = getSharedTokens('root')
			const call = (props: Partial<RootArgs['props']>) =>
				fn({ context: null, props: asRootProps(props), theme })

			const lg = call({ order: 'descend', size: 'lg' })
			const sm = call({ order: 'ascend', size: 'sm' })
			const again = call({ order: 'descend', size: 'lg' })

			expect(sm.inner!['--stat-font-size']).not.toBe(lg.inner!['--stat-font-size'])
			expect(sm.root!['--stat-direction']).toBe('column-reverse')
			expect(lg.root!['--stat-direction']).toBe('column')
			expect(again).toEqual(lg)
		})
	})
})
