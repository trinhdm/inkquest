import { countChildren } from '../countChildren'
import { Anonymous, Named, OtherNamed } from './utils'

describe('countChildren', () => {
	// both paths share one walk: `Children.toArray` drops null/undefined/boolean
	// entries first, and Fragments are opened up rather than counted as one
	describe('without a displayName filter', () => {
		it('counts every renderable child, text included', () => {
			expect(countChildren([<Named key="a">a</Named>, 'text', <OtherNamed key="b">b</OtherNamed>])).toBe(3)
		})

		it('descends into a Fragment, counting its children individually', () => {
			const children = <><Named>a</Named><Named>b</Named></>
			expect(countChildren(children)).toBe(2)
		})

		it('descends into nested Fragments', () => {
			const children = <><Named>a</Named><><Named>b</Named><OtherNamed>c</OtherNamed></></>
			expect(countChildren(children)).toBe(3)
		})

		it('ignores null, undefined and boolean children', () => {
			expect(countChildren([null, undefined, false, <Named key="a">a</Named>])).toBe(1)
		})

		it('returns 0 for no children', () => {
			expect(countChildren(null)).toBe(0)
			expect(countChildren(undefined)).toBe(0)
		})
	})

	describe('with a displayName filter (counts only matching elements)', () => {
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
