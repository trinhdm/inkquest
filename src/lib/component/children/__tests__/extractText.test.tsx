import { extractText } from '../extractText'
import { Named, OtherNamed } from './utils'
import type { FC } from 'react'

describe('extractText', () => {
	it('concatenates plain string children', () => {
		expect(extractText(['Hello, ', 'world'])).toBe('Hello, world')
	})

	it('stringifies numeric children', () => {
		expect(extractText([1, ' item'])).toBe('1 item')
	})

	it('recurses into an element that exposes a `children` prop', () => {
		expect(extractText(<Named>Nested text</Named>)).toBe('Nested text')
	})

	it('recurses through multiple levels of nested elements', () => {
		expect(
			extractText(
				<Named>
					<OtherNamed>Deeply nested</OtherNamed>
				</Named>
			)
		).toBe('Deeply nested')
	})

	it('skips elements that do not have a `children` prop at all', () => {
		const Void: FC = () => <span />
		expect(extractText(<Void />)).toBe('')
	})

	it('skips non-string, non-element, non-number nodes such as booleans and null', () => {
		expect(extractText([true, false, null, undefined, 'kept'])).toBe('kept')
	})

	it('trims leading and trailing whitespace from the final result', () => {
		expect(extractText(['  padded  '])).toBe('padded')
	})

	it('returns an empty string for no children', () => {
		expect(extractText(null)).toBe('')
		expect(extractText(undefined)).toBe('')
	})

	it('handles mixed text and element children together, in order', () => {
		expect(
			extractText([
				'Start ',
				<Named key="mid">middle</Named>,
				' End',
			])
		).toBe('Start middle End')
	})
})
