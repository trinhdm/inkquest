import { countChildren, filterChildren, verifyChildren } from '../filterChildren'
import { Anonymous, Named, OtherNamed } from './utils'

describe('countChildren', () => {
	// no displayName: countChildren now delegates straight to React's Children.count,
	// which does NOT descend into Fragments (a Fragment counts as one opaque child)
	// and does NOT skip null/undefined/boolean entries (it counts them too)
	describe('without a displayName filter (delegates to React.Children.count)', () => {
		it('counts every renderable child', () => {
			expect(countChildren([<Named key="a">a</Named>, 'text', <OtherNamed key="b">b</OtherNamed>])).toBe(3)
		})

		it('counts a Fragment as a single child rather than descending into it', () => {
			const children = <><Named>a</Named><Named>b</Named></>
			expect(countChildren(children)).toBe(1)
		})

		it('counts a nested Fragment the same way, as a single opaque child', () => {
			const children = <><Named>a</Named><><Named>b</Named><OtherNamed>c</OtherNamed></></>
			expect(countChildren(children)).toBe(1)
		})

		// matches Children.count's own semantics: null, undefined and boolean entries
		// are each counted towards the total, the opposite of the filtered path below
		it('counts null, undefined and boolean children towards the total', () => {
			expect(countChildren([null, undefined, false, <Named key="a">a</Named>])).toBe(4)
		})

		it('returns 0 for no children', () => {
			expect(countChildren(null)).toBe(0)
			expect(countChildren(undefined)).toBe(0)
		})
	})

	// with a displayName: this path is unchanged - it still walks Fragments by hand
	// and still skips non-matching, non-element and nullish/boolean children
	describe('with a displayName filter (still recurses into Fragments and skips non-matches)', () => {
		it('counts only children matching the given displayName', () => {
			expect(countChildren([<Named key="a">a</Named>, <OtherNamed key="b">b</OtherNamed>], 'Named')).toBe(1)
		})

		it('descends into a Fragment, counting only the matching children inside it', () => {
			const children = <><Named>a</Named><Named>b</Named></>
			expect(countChildren(children, 'Named')).toBe(2)
		})

		it('descends into nested Fragments', () => {
			const children = <><Named>a</Named><><Named>b</Named><OtherNamed>c</OtherNamed></></>
			expect(countChildren(children, 'Named')).toBe(2)
		})

		it('ignores null, undefined and boolean children', () => {
			expect(countChildren([null, undefined, false, <Named key="a">a</Named>], 'Named')).toBe(1)
		})

		it('does not count a text child towards a displayName match', () => {
			expect(countChildren(['text', <Named key="a">a</Named>], 'Named')).toBe(1)
		})

		it('does not count a component that has no displayName', () => {
			expect(countChildren([<Anonymous key="a">a</Anonymous>], 'Named')).toBe(0)
		})
	})
})

// `verifyChildren` is a dev-only guard: it counts children and `console.warn`s
// when the total is not what a component expects. Its only consumer today is
// `Field.tsx`, which calls it with `total: 1`.
//
// It counts via `countChildren(children)` with NO displayName — the branch that
// now short-circuits to `Children.count`. That branch neither descends into
// Fragments nor skips nullish/boolean children, so the guard can both warn when
// nothing is wrong and stay silent when something is. The `BUG:` tests below pin
// each of those miscounts; see the matching `it.failing` cases for the contract
// the guard is presumably meant to have.
describe('verifyChildren', () => {
	const warn = jest.spyOn(console, 'warn')

	beforeEach(() => { warn.mockImplementation(() => {}) })
	afterEach(() => { warn.mockReset() })
	afterAll(() => { warn.mockRestore() })

	describe('counting that is already correct', () => {
		it('stays silent when a single child matches the default total of 1', () => {
			verifyChildren({ children: <Named>a</Named>, name: 'Field' })
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
			})
			// note the message says "children" even when total is 1 — a grammar
			// nit in the source string, pinned here so a fix is deliberate
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
			verifyChildren({ children: undefined, name: 'Field' })
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
				env.NODE_ENV = 'production'
				verifyChildren({
					children: [<Named key="a">a</Named>, <Named key="b">b</Named>],
					name: 'Field',
				})
				expect(warn).not.toHaveBeenCalled()
			} finally {
				env.NODE_ENV = original
			}
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
			verifyChildren({ children: [<Named key="a">a</Named>, false], name: 'Field' })
			expect(warn).toHaveBeenCalledWith(
				'Field: 2 children found; a Field needs exactly 1 children.'
			)
		})

		it.failing('does not warn when the only real child sits beside a falsy conditional', () => {
			verifyChildren({ children: [<Named key="a">a</Named>, false], name: 'Field' })
			expect(warn).not.toHaveBeenCalled()
		})

		it('BUG: a falsy-only child satisfies the count, so a genuinely empty tree passes unnoticed', () => {
			// `{ cond && <X/> }` as the sole child, cond false — zero real children
			verifyChildren({ children: [false], name: 'Field' })
			expect(warn).not.toHaveBeenCalled()
		})

		it.failing('warns when the sole child is a falsy conditional, since no real child was rendered', () => {
			verifyChildren({ children: [false], name: 'Field' })
			expect(warn).toHaveBeenCalledWith(
				'Field: 0 children found; a Field needs exactly 1 children.'
			)
		})

		it('BUG: null and undefined children are counted too', () => {
			verifyChildren({ children: [null, undefined, <Named key="a">a</Named>], name: 'Field' })
			expect(warn).toHaveBeenCalledWith(
				'Field: 3 children found; a Field needs exactly 1 children.'
			)
		})

		it.failing('ignores null and undefined children when counting', () => {
			verifyChildren({ children: [null, undefined, <Named key="a">a</Named>], name: 'Field' })
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

		// `filterChildren` recurses through Fragments unconditionally, so the two
		// exported helpers disagree about what a Fragment is. This pins the
		// divergence rather than either side of it.
		it('BUG: filterChildren and verifyChildren disagree on a Fragment-wrapped tree', () => {
			const children = <><Named>a</Named><Named>b</Named></>

			expect(filterChildren(children, 'Named')).toHaveLength(2)

			verifyChildren({ children, name: 'Field', total: 2 })
			expect(warn).toHaveBeenCalledWith(
				'Field: 1 children found; a Field needs exactly 2 children.'
			)
		})
	})
})

describe('filterChildren', () => {
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

	it('BUG: array-form displayName does not actually exclude non-matching children - a dangling-else in filterChildren means the Array.isArray branch is only reachable from inside the `typeof displayName === \'string\'` arm, so it never runs when displayName is an array, and every named element is kept', () => {
		const result = filterChildren(
			[<Named key="a">a</Named>, <OtherNamed key="b">b</OtherNamed>],
			['OtherNamed']
		)

		// Intended behavior (per Accordion/Timeline usage) would be length 1
		// (only OtherNamed kept). Actual behavior keeps both.
		expect(result).toHaveLength(2)
	})

	it('drops elements whose component has no displayName at all', () => {
		const result = filterChildren([<Anonymous key="a">a</Anonymous>], 'Named')
		expect(result).toHaveLength(0)
	})

	it('passes non-element children (strings, numbers) through unfiltered', () => {
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
	})

	it('returns an empty array when given no children', () => {
		expect(filterChildren(null, 'Named')).toEqual([])
		expect(filterChildren(undefined, 'Named')).toEqual([])
	})

	it('excludes everything when nothing matches the requested displayName', () => {
		const result = filterChildren([<Named key="a">a</Named>], 'DoesNotExist')
		expect(result).toEqual([])
	})
})
