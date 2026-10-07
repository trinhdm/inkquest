import { countChildren } from '../countChildren'
import { filterChildren, verifyChildren } from '../filterChildren'
import { Anonymous, Named, OtherNamed } from './utils'

// `verifyChildren` is a dev-only guard: it counts children and `console.warn`s
// when the count is not what a component expects. It has three modes, checked
// in this order: `max`, then `total`, then `extra`. With none of them it is a
// no-op (there is no default `total`).
//
// It counts via `countChildren(children)` with NO displayName, which is just
// `Children.count`. That neither descends into Fragments nor skips
// nullish/boolean children, so called directly the guard can warn when nothing
// is wrong. The `BUG:` tests pin each miscount; the `it.failing` twin states the
// intended contract. (`filterChildren` itself avoids this by verifying an
// already-filtered list.)
describe('verifyChildren', () => {
	let warn: jest.SpyInstance

	beforeEach(() => { warn = jest.spyOn(console, 'warn').mockImplementation(() => {}) })
	afterEach(() => { warn.mockRestore() })

	describe('with neither total, max nor extra', () => {
		it('warns nothing, whatever the child count', () => {
			verifyChildren({ children: undefined, name: 'Field', extra: [] })
			verifyChildren({
				children: [<Named key="a">a</Named>, <Named key="b">b</Named>],
				name: 'Field',
				extra: [],
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

	// `max` wins over `total`. The source warns when count >= max + 1 and words
	// it as "needs less than <max + 1> children".
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

		it('takes precedence over total, so a count that breaks only total stays silent', () => {
			verifyChildren({
				children: [<Named key="a">a</Named>],
				name: 'Footer',
				max: 2,
				total: 2,
			})
			expect(warn).not.toHaveBeenCalled()
		})
	})

	describe('extra', () => {
		it('warns with the number of extra subcomponents', () => {
			verifyChildren({ children: null, name: 'Card', extra: [<Named key="a">a</Named>, <Named key="b">b</Named>] })
			expect(warn).toHaveBeenCalledWith('Card: 2 extra subcomponent(s) found.')
		})

		it('stays silent for an empty extra list', () => {
			verifyChildren({ children: null, name: 'Card', extra: [] })
			expect(warn).not.toHaveBeenCalled()
		})
	})

	// Each pair below pins the current miscount and states the intended contract.
	// The `it.failing` case passes *because* the behaviour is wrong; it will start
	// failing the moment `countChildren`'s unfiltered path regains Fragment-descent
	// and nullish-filtering, which is the signal to promote it to a plain `it` and
	// delete its `BUG:` twin.
	describe('miscounts caused by countChildren delegating to Children.count', () => {
		it('BUG: a falsy conditional sibling is counted as a real child, so a correct tree warns anyway', () => {
			// the ordinary `{ cond && <X/> }` pattern with cond false
			verifyChildren({ children: [<Named key="a">a</Named>, false], name: 'Field', total: 1 })
			expect(warn).toHaveBeenCalledWith(
				'Field: 2 children found; a Field needs exactly 1 children.'
			)
		})

		it.failing('does not warn when the only real child sits beside a falsy conditional', () => {
			verifyChildren({ children: [<Named key="a">a</Named>, false], name: 'Field', total: 1 })
			expect(warn).not.toHaveBeenCalled()
		})

		it('BUG: a falsy-only child satisfies the count, so a genuinely empty tree passes unnoticed', () => {
			// `{ cond && <X/> }` as the sole child, cond false - zero real children
			verifyChildren({ children: [false], name: 'Field', total: 1 })
			expect(warn).not.toHaveBeenCalled()
		})

		it.failing('warns when the sole child is a falsy conditional, since no real child was rendered', () => {
			verifyChildren({ children: [false], name: 'Field', total: 1 })
			expect(warn).toHaveBeenCalledWith(
				'Field: 0 children found; a Field needs exactly 1 children.'
			)
		})

		it('BUG: null and undefined children are counted too', () => {
			verifyChildren({ children: [null, undefined, <Named key="a">a</Named>], name: 'Field', total: 1 })
			expect(warn).toHaveBeenCalledWith(
				'Field: 3 children found; a Field needs exactly 1 children.'
			)
		})

		it.failing('ignores null and undefined children when counting', () => {
			verifyChildren({ children: [null, undefined, <Named key="a">a</Named>], name: 'Field', total: 1 })
			expect(warn).not.toHaveBeenCalled()
		})

		it('BUG: a Fragment counts as one child instead of being descended into', () => {
			verifyChildren({
				children: <><Named>a</Named><Named>b</Named></>,
				name: 'Field',
				total: 2,
			})
			expect(warn).toHaveBeenCalledWith(
				'Field: 1 children found; a Field needs exactly 2 children.'
			)
		})

		it.failing('descends into a Fragment so its children count individually', () => {
			verifyChildren({
				children: <><Named>a</Named><Named>b</Named></>,
				name: 'Field',
				total: 2,
			})
			expect(warn).not.toHaveBeenCalled()
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

		it('silently drops an unrelated child beside the named ones', () => {
			// positive control: the same call does warn when a name is missing
			filterChildren([<Anonymous key="x">x</Anonymous>], ['Named', 'OtherNamed'], { name: 'Pair', total: 2 })
			expect(warn).toHaveBeenCalledTimes(1)
			warn.mockClear()

			filterChildren(
				[<Named key="a">a</Named>, <OtherNamed key="b">b</OtherNamed>, <Anonymous key="x">x</Anonymous>],
				['Named', 'OtherNamed'],
				{ name: 'Pair', total: 2 }
			)
			expect(warn).not.toHaveBeenCalled()
		})

		// F3 remainder: duplicates are dropped by `filtered[i] != null`, so the
		// verified count never exceeds the number of names and a repeated
		// subcomponent can never trip `total`.
		it('BUG: a duplicated named child is silently dropped, so total never notices it', () => {
			filterChildren(
				[<Named key="a">a</Named>, <Named key="b">b</Named>, <OtherNamed key="c">c</OtherNamed>],
				['Named', 'OtherNamed'],
				{ name: 'Pair', total: 2 }
			)

			expect(warn).not.toHaveBeenCalled()
		})

		it.failing('warns when a named child appears more than once', () => {
			filterChildren(
				[<Named key="a">a</Named>, <Named key="b">b</Named>, <OtherNamed key="c">c</OtherNamed>],
				['Named', 'OtherNamed'],
				{ name: 'Pair', total: 2 }
			)

			expect(warn).toHaveBeenCalled()
		})
	})

	it('drops elements whose component has no displayName at all', () => {
		const result = filterChildren([<Anonymous key="a">a</Anonymous>], 'Named')
		expect(result).toHaveLength(0)
	})

	// F2: the old `flatMap` returned `[child]` for non-elements; the `forEach`
	// rewrite only handles elements, so text never reaches the result.
	it('BUG: non-element children (strings, numbers) are dropped', () => {
		const result = filterChildren(['plain text', 42], 'Named')
		expect(result).toEqual([])
	})

	it.failing('passes non-element children (strings, numbers) through unfiltered', () => {
		const result = filterChildren(['plain text', 42], 'Named')
		expect(result).toEqual(['plain text', 42])
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
		it('verifies the filtered matches, not the raw children', () => {
			filterChildren(
				[<Named key="a">a</Named>, <OtherNamed key="b">b</OtherNamed>, <OtherNamed key="c">c</OtherNamed>],
				'Named',
				{ name: 'Host', total: 1 }
			)

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

		it('warns nothing when no verifyArgs are given', () => {
			filterChildren([<Named key="a">a</Named>, <Named key="b">b</Named>], 'Named')
			expect(warn).not.toHaveBeenCalled()
		})
	})
})
