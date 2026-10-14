import { getSharedTokens } from '../utils'
import { rem } from '@/lib/general'

type RootArgs = Parameters<ReturnType<typeof getSharedTokens<'root'>>>[0]
type GroupArgs = Parameters<ReturnType<typeof getSharedTokens<'group'>>>[0]

// A grouped Accordion has an Accordion.Group context (what `useSafeRootCtx`
// returns, including `rootName`); a standalone one has `null`.
const groupValues = { layout: 'default', order: 2, size: 'lg' } as const
const groupContext = {
	...groupValues,
	rootName: 'Accordion.Group',
} as unknown as NonNullable<RootArgs['context']>

const theme = { el: {} } as never

// `children` is required on the real props but never read by the tokens.
const asRootProps = (props: Partial<RootArgs['props']>) => props as RootArgs['props']
const asGroupProps = (props: Partial<GroupArgs['props']>) => props as GroupArgs['props']

const rootTokens = (props: Partial<RootArgs['props']>, context: RootArgs['context'] = null) =>
	getSharedTokens('root')({ context, props: asRootProps(props), theme })

const groupTokens = (props: Partial<GroupArgs['props']>, context?: GroupArgs['context']) =>
	getSharedTokens('group')({ context, props: asGroupProps(props), theme })

describe('getSharedTokens', () => {
	afterEach(() => {
		// jsdom leaves the root font-size unset (computed fontSize === ''), so
		// rem()'s internal base resolves to NaN unless a test opts in below.
		// See src/lib/general/__tests__/unitConverter.test.ts for the same idiom.
		document.documentElement.style.fontSize = ''
	})

	describe('deriving tokens from props (standalone Accordion)', () => {
		it('returns an empty object when no size is given', () => {
			expect(rootTokens({})).toEqual({})
		})

		it('derives root CSS custom properties for a given size, using the default order (3)', () => {
			document.documentElement.style.fontSize = '16px'
			const result = rootTokens({ size: 'sm' })

			// sm shifts the heading order by its step (2): h3 -> h5. No step-size
			// token without layout="steps".
			expect(result.root).toEqual({
				'--accordion-column-width': 'var(--space-5)',
				'--accordion-gap': 'var(--space-3)',
				'--accordion-padding': 'var(--space-4)',
				'--accordion-indicator-size': 'var(--font-size-16)',
				'--accordion-step-size': undefined,
				'--accordion-title-size': 'var(--inkq-font-size-h5)',
			})
		})

		it('returns only a `root` token group -- there is no longer a `title`/`content` split', () => {
			document.documentElement.style.fontSize = '16px'

			expect(Object.keys(rootTokens({ size: 'sm' }))).toEqual(['root'])
		})

		it('only emits a step-size token for layout="steps", and none for the default layout', () => {
			document.documentElement.style.fontSize = '16px'

			expect(rootTokens({ size: 'md' }).root!['--accordion-step-size']).toBeUndefined()
			expect(rootTokens({ size: 'md', layout: 'default' }).root!['--accordion-step-size']).toBeUndefined()
			expect(rootTokens({ size: 'md', layout: 'steps' }).root!['--accordion-step-size']).toEqual(expect.any(String))
		})

		it('uses a smaller step unit (rem(3)) for size="sm" than for "md"/"lg" (rem(6)) under layout="steps"', () => {
			document.documentElement.style.fontSize = '16px'
			const sm = rootTokens({ layout: 'steps', size: 'sm' })
			const md = rootTokens({ layout: 'steps', size: 'md' })
			const lg = rootTokens({ layout: 'steps', size: 'lg' })

			// the unit is multiplied by (step + 1): sm 3, md 2, lg 1
			expect(sm.root!['--accordion-step-size']).toBe(
				`calc((var(--accordion-title-size) - var(--accordion-indicator-size)) + (${ rem(3) } * 3) )`
			)
			expect(md.root!['--accordion-step-size']).toBe(
				`calc((var(--accordion-title-size) - var(--accordion-indicator-size)) + (${ rem(6) } * 2) )`
			)
			expect(lg.root!['--accordion-step-size']).toBe(
				`calc((var(--accordion-title-size) - var(--accordion-indicator-size)) + (${ rem(6) } * 1) )`
			)
		})

		it('applies a smaller column width for smaller sizes (lg has step 0, sm has step 2)', () => {
			const lg = rootTokens({ size: 'lg' })
			const sm = rootTokens({ size: 'sm' })

			// lg: colWidth 11 - 3*0 = 11; sm: colWidth 11 - 3*2 = 5
			expect(lg.root!['--accordion-column-width']).toBe('var(--space-11)')
			expect(sm.root!['--accordion-column-width']).toBe('var(--space-5)')
		})

		it('honors a custom `order`, reflected in the derived heading title-size token', () => {
			// lg has step 0, so order passes through unshifted
			const result = rootTokens({ order: 1, size: 'lg' })
			expect(result.root!['--accordion-title-size']).toBe('var(--inkq-font-size-h1)')
		})

		it('only layout="steps" changes the root tokens -- it adds the step-size and nothing else', () => {
			document.documentElement.style.fontSize = '16px'
			const withLayout = rootTokens({ layout: 'steps', order: 1, size: 'lg' }),
				withoutLayout = rootTokens({ order: 1, size: 'lg' })

			expect({ ...withLayout.root, '--accordion-step-size': undefined }).toEqual(withoutLayout.root)
			expect(withLayout.root!['--accordion-step-size']).toEqual(expect.any(String))
			expect(withLayout.root).not.toHaveProperty('--accordion-content-indent')
			expect(withLayout.root).not.toHaveProperty('--accordion-title-indent')
		})
	})

	describe('a group\'s values always win', () => {
		beforeEach(() => {
			document.documentElement.style.fontSize = '16px'
		})

		it('behaves like "root" when called with no argument', () => {
			const props = { layout: 'steps', order: 2, size: 'md' } as const

			expect(getSharedTokens()({ context: null, props: asRootProps(props), theme }))
				.toEqual(rootTokens(props))
			expect(getSharedTokens()({ context: groupContext, props: asRootProps(props), theme }))
				.toEqual({})
		})

		it('"root" with no context (standalone) returns tokens', () => {
			const result = rootTokens({ size: 'md' })

			expect(result.root).toEqual(expect.objectContaining({
				'--accordion-column-width': 'var(--space-8)',
			}))
		})

		it('"root" with a group context returns {} so the group\'s tokens apply by inheritance', () => {
			expect(rootTokens({ size: 'md' }, groupContext)).toEqual({})
		})

		it('"root" with a group context returns {} even when its own size, order and layout differ from the group\'s', () => {
			const props = { layout: 'steps', order: 5, size: 'sm' } as const

			// positive control: the same props do produce tokens when standalone,
			// and they differ from the tokens the group's own values produce
			expect(rootTokens(props).root).toBeDefined()
			expect(rootTokens(props)).not.toEqual(rootTokens(groupValues))
			// inside the group, they are ignored
			expect(rootTokens(props, groupContext)).toEqual({})
		})

		it('"group" returns the same tokens with or without a context', () => {
			const props = { layout: 'steps', order: 2, size: 'md' } as const
			const without = groupTokens(props)

			expect(without.root).toBeDefined()
			expect(groupTokens(props, groupContext as unknown as GroupArgs['context'])).toEqual(without)
		})

		it('"group" and a standalone "root" give the same tokens for the same props', () => {
			const props = { layout: 'steps', order: 2, size: 'lg' } as const

			expect(groupTokens(props)).toEqual(rootTokens(props))
			expect(groupTokens(props).root).toBeDefined()
		})

		it('does not cache between calls: one token function gives different results for different props', () => {
			const fn = getSharedTokens('root')
			const small = fn({ context: null, props: asRootProps({ size: 'sm' }), theme })
			const large = fn({ context: null, props: asRootProps({ size: 'lg' }), theme })
			const none = fn({ context: null, props: asRootProps({}), theme })

			expect(small.root!['--accordion-column-width']).toBe('var(--space-5)')
			expect(large.root!['--accordion-column-width']).toBe('var(--space-11)')
			expect(none).toEqual({})
		})
	})
})
