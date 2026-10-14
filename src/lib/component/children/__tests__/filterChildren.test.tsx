import { Fragment } from 'react'
import { countChildren } from '../countChildren'
import { filterChildren, verifyChildren } from '../filterChildren'
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

describe('filterChildren', () => {
	let warn: jest.SpyInstance

	beforeEach(() => { warn = jest.spyOn(console, 'warn').mockImplementation(() => {}) })
	afterEach(() => { warn.mockRestore() })

	it('keeps only children whose component displayName matches the given string', () => {
		const result = filterChildren(
			[<Named key="a">a</Named>, <OtherNamed key="b">b</OtherNamed>],
			'Named'
		)

		expect(result).toHaveLength(1)
	})

	it('keeps children whose displayName is included in a given array of names', () => {
		const result = filterChildren(
			[<Named key="a">a</Named>, <OtherNamed key="b">b</OtherNamed>],
			['Named', 'OtherNamed']
		)

		expect(result).toHaveLength(2)
	})

	describe('array of names', () => {
		it('excludes children whose displayName is not in the list', () => {
			const result = filterChildren(
				[<Named key="a">a</Named>, <OtherNamed key="b">b</OtherNamed>],
				['OtherNamed']
			)

			expect(result).toHaveLength(1)
			expect(result[0]).toMatchObject({ type: OtherNamed })
		})

		it('returns one slot per name, in the order of the names, regardless of child order', () => {
			const result = filterChildren(
				[<OtherNamed key="b">b</OtherNamed>, <Named key="a">a</Named>],
				['Named', 'OtherNamed']
			)

			expect(result[0]).toMatchObject({ type: Named })
			expect(result[1]).toMatchObject({ type: OtherNamed })
		})

		it('leaves a null slot for a name that has no matching child', () => {
			const result = filterChildren([<Named key="a">a</Named>], ['Named', 'OtherNamed'])

			expect(result).toHaveLength(2)
			expect(result[0]).toMatchObject({ type: Named })
			expect(result[1]).toBeNull()
		})

		it('keeps the first of two children sharing a name', () => {
			const result = filterChildren(
				[<Named key="a">first</Named>, <Named key="b">second</Named>],
				['Named']
			)

			expect(result).toHaveLength(1)
			expect(result[0]).toMatchObject({ props: { children: 'first' } })
		})

		it('finds named children inside a Fragment', () => {
			const result = filterChildren(
				<><OtherNamed>b</OtherNamed><Named>a</Named></>,
				['Named', 'OtherNamed']
			)

			expect(result[0]).toMatchObject({ type: Named })
			expect(result[1]).toMatchObject({ type: OtherNamed })
		})

		it('warns when a named child is missing and total expects them all', () => {
			filterChildren([<Named key="a">a</Named>], ['Named', 'OtherNamed'], { name: 'Pair', total: 2 })

			expect(warn).toHaveBeenCalledWith('Pair: 1 children found; a Pair needs exactly 2 children.')
		})

		it('stays silent when every named child is present', () => {
			filterChildren(
				[<Named key="a">a</Named>, <OtherNamed key="b">b</OtherNamed>],
				['Named', 'OtherNamed'],
				{ name: 'Pair', total: 2 }
			)

			expect(warn).not.toHaveBeenCalled()
		})

		it('drops an unrelated child beside the named ones and warns about it, without counting it', () => {
			const result = filterChildren(
				[<Named key="a">a</Named>, <OtherNamed key="b">b</OtherNamed>, <div key="x">x</div>],
				['Named', 'OtherNamed'],
				{ name: 'Pair', total: 2 }
			)

			expect(result).toHaveLength(2)
			expect(warn).toHaveBeenCalledTimes(1)
			expect(warn).toHaveBeenCalledWith('Pair: ignoring unrelated <div>.')
		})

		// a repeat is still dropped (the first match keeps its slot), but now warns
		it('drops a repeated named child, keeping the first, and warns about it', () => {
			const result = filterChildren(
				[<Named key="a">first</Named>, <Named key="b">second</Named>, <OtherNamed key="c">c</OtherNamed>],
				['Named', 'OtherNamed'],
				{ name: 'Pair', total: 2 }
			)

			expect(result[0]).toMatchObject({ props: { children: 'first' } })
			expect(warn).toHaveBeenCalledTimes(1)
			expect(warn).toHaveBeenCalledWith('Pair: ignoring repeated Named; only the first is rendered.')
		})

		it('catches a repeat hidden inside a Fragment', () => {
			filterChildren(
				[<Named key="a">a</Named>, <Fragment key="f"><Named>b</Named><OtherNamed>c</OtherNamed></Fragment>],
				['Named', 'OtherNamed'],
				{ name: 'Pair', total: 2 }
			)

			expect(warn).toHaveBeenCalledTimes(1)
			expect(warn).toHaveBeenCalledWith('Pair: ignoring repeated Named; only the first is rendered.')
		})
	})

	it('drops elements whose component has no displayName at all', () => {
		const result = filterChildren([<Anonymous key="a">a</Anonymous>], 'Named')
		expect(result).toHaveLength(0)
	})

	// non-element children are dropped on purpose: only matching elements survive
	it('drops non-element children (strings, numbers), keeping the matching element beside them', () => {
		const result = filterChildren(['plain text', 42, <Named key="a">a</Named>], 'Named')

		expect(result).toHaveLength(1)
		expect(result[0]).toMatchObject({ type: Named })
	})

	it('recurses into a Fragment and filters its children by the same displayName rule', () => {
		const result = filterChildren(
			<>
				<Named key="a">a</Named>
				<OtherNamed key="b">b</OtherNamed>
			</>,
			'Named'
		)

		expect(result).toHaveLength(1)
		expect(result[0]).toMatchObject({ type: Named })
	})

	it('recurses into nested Fragments', () => {
		const result = filterChildren(
			<><><Named>a</Named></><Named>b</Named></>,
			'Named'
		)

		expect(result).toHaveLength(2)
	})

	it('keeps filterChildren and countChildren in agreement on a Fragment-wrapped tree', () => {
		const children = <><Named>a</Named><Named>b</Named></>

		expect(filterChildren(children, 'Named')).toHaveLength(countChildren(children, 'Named'))
	})

	it('returns an empty array when given no children', () => {
		expect(filterChildren(null, 'Named')).toEqual([])
		expect(filterChildren(undefined, 'Named')).toEqual([])
	})

	it('ignores falsy conditional siblings', () => {
		const result = filterChildren([<Named key="a">a</Named>, false, null, undefined], 'Named')
		expect(result).toHaveLength(1)
	})

	it('excludes everything when nothing matches the requested displayName', () => {
		const result = filterChildren([<Named key="a">a</Named>], 'DoesNotExist')
		expect(result).toEqual([])
	})

	describe('verifyArgs', () => {
		it('counts only the matches, and reports the rest as unrelated', () => {
			filterChildren(
				[<Named key="a">a</Named>, <OtherNamed key="b">b</OtherNamed>, 'loose text'],
				'Named',
				{ name: 'Host', total: 1 }
			)

			expect(warn).toHaveBeenCalledTimes(1)
			expect(warn).toHaveBeenCalledWith('Host: ignoring unrelated OtherNamed, loose text.')
		})

		it('does not report whitespace-only text, such as a stray space between tags', () => {
			// positive control: real text in the same spot is reported
			filterChildren([<Named key="a">a</Named>, 'x'], 'Named', { name: 'Host' })
			expect(warn).toHaveBeenCalledTimes(1)
			warn.mockClear()

			filterChildren([' ', <Named key="a">a</Named>, '\n\t '], 'Named', { name: 'Host' })
			expect(warn).not.toHaveBeenCalled()
		})

		it('keeps every match in single-name mode, so repeats are not reported', () => {
			const result = filterChildren([<Named key="a">a</Named>, <Named key="b">b</Named>], 'Named', { name: 'Host' })

			expect(result).toHaveLength(2)
			expect(warn).not.toHaveBeenCalled()
		})

		it('does not report a falsy conditional as unrelated', () => {
			// positive control: a real non-matching child in the same spot is reported
			filterChildren([<Named key="a">a</Named>, <OtherNamed key="b">b</OtherNamed>], 'Named', { name: 'Host' })
			expect(warn).toHaveBeenCalledTimes(1)
			warn.mockClear()

			filterChildren([<Named key="a">a</Named>, false, null], 'Named', { name: 'Host' })
			expect(warn).not.toHaveBeenCalled()
		})

		it('warns when the number of matches breaks total', () => {
			filterChildren(
				[<Named key="a">a</Named>, <Named key="b">b</Named>],
				'Named',
				{ name: 'Host', total: 1 }
			)

			expect(warn).toHaveBeenCalledWith('Host: 2 children found; a Host needs exactly 1 children.')
		})

		it('warns when the number of matches exceeds max', () => {
			filterChildren(
				[<Named key="a">a</Named>, <Named key="b">b</Named>],
				'Named',
				{ name: 'Host', max: 1 }
			)

			expect(warn).toHaveBeenCalledWith('Host: 2 children found; a Host needs less than 2 children.')
		})

		it('warns nothing when no verifyArgs are given, even with unrelated children', () => {
			filterChildren([<Named key="a">a</Named>, <OtherNamed key="b">b</OtherNamed>, 'loose text'], 'Named')
			expect(warn).not.toHaveBeenCalled()
		})
	})
})
