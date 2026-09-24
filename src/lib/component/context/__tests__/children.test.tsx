import { extractChildrenText, filterChildren, getChildKey } from '../children'
import type { FC, ReactNode } from 'react'

const Named: FC<{ children?: ReactNode }> = ({ children }) => <>{ children }</>
Named.displayName = 'Named'

const OtherNamed: FC<{ children?: ReactNode }> = ({ children }) => <>{ children }</>
OtherNamed.displayName = 'OtherNamed'

const Anonymous: FC<{ children?: ReactNode }> = ({ children }) => <>{ children }</>
// intentionally no displayName

describe('getChildKey', () => {
	it('returns the element key when the element has an explicit key', () => {
		const child = <Named key="explicit-key">content</Named>
		expect(getChildKey(child, 3)).toBe('explicit-key')
	})

	it('falls back to the index when the element has no key', () => {
		const child = <Named>content</Named>
		expect(getChildKey(child, 2)).toBe(2)
	})

	it('falls back to the index for a plain string child (not a valid element)', () => {
		expect(getChildKey('just text', 0)).toBe(0)
	})

	it('falls back to the index for null', () => {
		expect(getChildKey(null, 5)).toBe(5)
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

describe('extractChildrenText', () => {
	it('concatenates plain string children', () => {
		expect(extractChildrenText(['Hello, ', 'world'])).toBe('Hello, world')
	})

	it('stringifies numeric children', () => {
		expect(extractChildrenText([1, ' item'])).toBe('1 item')
	})

	it('recurses into an element that exposes a `children` prop', () => {
		expect(extractChildrenText(<Named>Nested text</Named>)).toBe('Nested text')
	})

	it('recurses through multiple levels of nested elements', () => {
		expect(
			extractChildrenText(
				<Named>
					<OtherNamed>Deeply nested</OtherNamed>
				</Named>
			)
		).toBe('Deeply nested')
	})

	it('skips elements that do not have a `children` prop at all', () => {
		const Void: FC = () => <span />
		expect(extractChildrenText(<Void />)).toBe('')
	})

	it('skips non-string, non-element, non-number nodes such as booleans and null', () => {
		expect(extractChildrenText([true, false, null, undefined, 'kept'])).toBe('kept')
	})

	it('trims leading and trailing whitespace from the final result', () => {
		expect(extractChildrenText(['  padded  '])).toBe('padded')
	})

	it('returns an empty string for no children', () => {
		expect(extractChildrenText(null)).toBe('')
		expect(extractChildrenText(undefined)).toBe('')
	})

	it('handles mixed text and element children together, in order', () => {
		expect(
			extractChildrenText([
				'Start ',
				<Named key="mid">middle</Named>,
				' End',
			])
		).toBe('Start middle End')
	})
})
