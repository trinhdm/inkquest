import { countChildren } from '../countChildren'
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
