import { verifyChildren } from '../verifyChildren'
import { Anonymous, Named, OtherNamed } from './utils'

// `verifyChildren` is a dev-only guard: it counts children and `console.warn`s
// when the count is not what a component expects. Each check - `max`, `total`,
// `repeated`, `unrelated` - runs on its own, so a correct count never hides a
// repeated or unrelated child. With none of them it is a no-op (there is no
// default `total`).
//
// It counts via `countChildren`, which skips null/undefined/boolean children and
// descends into Fragments, so it can also be called directly on raw children.
describe('verifyChildren', () => {
	let warn: jest.SpyInstance

	beforeEach(() => { warn = jest.spyOn(console, 'warn').mockImplementation(() => {}) })
	afterEach(() => { warn.mockRestore() })

	describe('with no total, max, repeated or unrelated', () => {
		it('warns nothing, whatever the child count', () => {
			verifyChildren({ children: undefined, name: 'Field', repeated: [], unrelated: [] })
			verifyChildren({
				children: [<Named key="a">a</Named>, <Named key="b">b</Named>],
				name: 'Field',
			})
			expect(warn).not.toHaveBeenCalled()
		})
	})

	describe('total', () => {
		it('stays silent when a single child matches total 1', () => {
			verifyChildren({ children: <Named>a</Named>, name: 'Field', total: 1 })
			expect(warn).not.toHaveBeenCalled()
		})

		it('stays silent when the child count matches an explicit total', () => {
			verifyChildren({
				children: [<Named key="a">a</Named>, <Named key="b">b</Named>, <Named key="c">c</Named>],
				name: 'Field',
				total: 3,
			})
			expect(warn).not.toHaveBeenCalled()
		})

		it('warns with the component name, the real count and the expected total when there are too many', () => {
			verifyChildren({
				children: [<Named key="a">a</Named>, <Named key="b">b</Named>],
				name: 'Field',
				total: 1,
			})
			// the message says "children" even when total is 1 - a grammar nit in
			// the source string, pinned here so a fix is deliberate
			expect(warn).toHaveBeenCalledWith(
				'Field: 2 children found; a Field needs exactly 1 children.'
			)
		})

		it('warns when there are too few', () => {
			verifyChildren({ children: <Named>a</Named>, name: 'Field', total: 2 })
			expect(warn).toHaveBeenCalledWith(
				'Field: 1 children found; a Field needs exactly 2 children.'
			)
		})

		it('warns that zero children were found when given none at all', () => {
			verifyChildren({ children: undefined, name: 'Field', total: 1 })
			expect(warn).toHaveBeenCalledWith(
				'Field: 0 children found; a Field needs exactly 1 children.'
			)
		})

		it('stays silent in production even when the count is wrong, since the guard is dev-only', () => {
			// `process.env.NODE_ENV` is typed read-only here, so reach it through a
			// widened view rather than casting away the whole of `process.env`
			const env = process.env as { NODE_ENV?: string },
				original = env.NODE_ENV

			try {
				// positive control: the same call does warn outside production
				verifyChildren({ children: [<Named key="a">a</Named>, <Named key="b">b</Named>], name: 'Field', total: 1 })
				expect(warn).toHaveBeenCalledTimes(1)
				warn.mockClear()

				env.NODE_ENV = 'production'
				verifyChildren({
					children: [<Named key="a">a</Named>, <Named key="b">b</Named>],
					name: 'Field',
					total: 1,
				})
				expect(warn).not.toHaveBeenCalled()
			} finally {
				env.NODE_ENV = original
			}
		})
	})

	// warns when count > max, and words the limit as "needs less than <max + 1>
	// children", so a count of exactly max is allowed
	describe('max', () => {
		it('stays silent at exactly max children', () => {
			verifyChildren({
				children: [<Named key="a">a</Named>, <Named key="b">b</Named>],
				name: 'Footer',
				max: 2,
			})
			expect(warn).not.toHaveBeenCalled()
		})

		it('stays silent below max, including zero children', () => {
			verifyChildren({ children: undefined, name: 'Footer', max: 2 })
			expect(warn).not.toHaveBeenCalled()
		})

		it('warns once the count exceeds max', () => {
			verifyChildren({
				children: [<Named key="a">a</Named>, <Named key="b">b</Named>, <Named key="c">c</Named>],
				name: 'Footer',
				max: 2,
			})
			expect(warn).toHaveBeenCalledTimes(1)
			expect(warn).toHaveBeenCalledWith(
				'Footer: 3 children found; a Footer needs less than 3 children.'
			)
		})

		it('is checked independently of total, so a count that breaks only total still warns', () => {
			verifyChildren({
				children: [<Named key="a">a</Named>],
				name: 'Footer',
				max: 2,
				total: 2,
			})
			expect(warn).toHaveBeenCalledTimes(1)
			expect(warn).toHaveBeenCalledWith('Footer: 1 children found; a Footer needs exactly 2 children.')
		})
	})

	describe('repeated', () => {
		it('names each repeated child and says only the first is rendered', () => {
			verifyChildren({ children: null, name: 'Card', repeated: [<Named key="a">a</Named>, <OtherNamed key="b">b</OtherNamed>] })
			expect(warn).toHaveBeenCalledWith('Card: ignoring repeated Named, OtherNamed; only the first is rendered.')
		})

		it('stays silent for an empty list', () => {
			verifyChildren({ children: null, name: 'Card', repeated: [] })
			expect(warn).not.toHaveBeenCalled()
		})
	})

	describe('unrelated', () => {
		it('labels text, numbers, host elements and components without a displayName', () => {
			verifyChildren({
				children: null,
				name: 'Card',
				unrelated: ['loose text', 42, <div key="d" />, <Anonymous key="a">a</Anonymous>, <Named key="n">n</Named>],
			})
			expect(warn).toHaveBeenCalledWith('Card: ignoring unrelated loose text, text \'42\', <div>, unnamed component, Named.')
		})

		it('cuts a non-string, non-element child to its first 24 characters', () => {
			verifyChildren({ children: null, name: 'Card', unrelated: [BigInt('1234567890123456789012345678')] })
			expect(warn).toHaveBeenCalledWith('Card: ignoring unrelated text \'123456789012345678901234\'.')
		})

		it('prints long text in full, trimmed', () => {
			verifyChildren({ children: null, name: 'Card', unrelated: ['  The quick brown fox jumps over the lazy dog  '] })
			expect(warn).toHaveBeenCalledWith('Card: ignoring unrelated The quick brown fox jumps over the lazy dog.')
		})

		it('stays silent for an empty list', () => {
			verifyChildren({ children: null, name: 'Card', unrelated: [] })
			expect(warn).not.toHaveBeenCalled()
		})

		it('still warns when the count itself is correct', () => {
			verifyChildren({
				children: [<Named key="a">a</Named>],
				name: 'Card',
				total: 1,
				unrelated: [<div key="d" />],
			})
			expect(warn).toHaveBeenCalledTimes(1)
			expect(warn).toHaveBeenCalledWith('Card: ignoring unrelated <div>.')
		})
	})

	// counting goes through countChildren, so the ordinary `{ cond && <X/> }`
	// pattern and Fragment-wrapped children are counted as a reader would
	describe('counts only real children', () => {
		it('does not warn when the only real child sits beside a falsy conditional', () => {
			// positive control: the same tree with a real second child does warn
			verifyChildren({ children: [<Named key="a">a</Named>, <Named key="b">b</Named>], name: 'Field', total: 1 })
			expect(warn).toHaveBeenCalledTimes(1)
			warn.mockClear()

			verifyChildren({ children: [<Named key="a">a</Named>, false], name: 'Field', total: 1 })
			expect(warn).not.toHaveBeenCalled()
		})

		it('warns when the sole child is a falsy conditional, since no real child was rendered', () => {
			verifyChildren({ children: [false], name: 'Field', total: 1 })
			expect(warn).toHaveBeenCalledWith(
				'Field: 0 children found; a Field needs exactly 1 children.'
			)
		})

		it('ignores null and undefined children', () => {
			verifyChildren({ children: [null, undefined, <Named key="a">a</Named>], name: 'Field', total: 2 })
			expect(warn).toHaveBeenCalledWith(
				'Field: 1 children found; a Field needs exactly 2 children.'
			)
		})

		it('descends into a Fragment so its children count individually', () => {
			verifyChildren({
				children: <><Named>a</Named><Named>b</Named></>,
				name: 'Field',
				total: 1,
			})
			expect(warn).toHaveBeenCalledWith(
				'Field: 2 children found; a Field needs exactly 1 children.'
			)
		})
	})
})
