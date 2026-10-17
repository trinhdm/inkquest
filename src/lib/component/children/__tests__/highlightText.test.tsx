import { isValidElement, type ReactElement, type ReactNode } from 'react'
import { render } from '@testing-library/react'
import { highlightText } from '../highlightText'
import { Named } from './utils'

const html = (node: ReactNode) => render(<div>{ node }</div>).container.innerHTML

describe('highlightText', () => {
	it('wraps each hit in a <mark>', () => {
		expect(html(highlightText('red ink, blue ink', ['ink'])))
			.toBe('<div>red <mark>ink</mark>, blue <mark>ink</mark></div>')
	})

	it('matches case-insensitively and keeps the original casing', () => {
		expect(html(highlightText('Black INK', ['ink']))).toBe('<div>Black <mark>INK</mark></div>')
	})

	it('highlights every term in the list', () => {
		expect(html(highlightText('fine line work', ['fine', 'work'])))
			.toBe('<div><mark>fine</mark> line <mark>work</mark></div>')
	})

	it('treats regex metacharacters in a term as literal text', () => {
		expect(html(highlightText('cost (usd) $5.00 a+b', ['(usd)', '$5.00', 'a+b'])))
			.toBe('<div>cost <mark>(usd)</mark> <mark>$5.00</mark> <mark>a+b</mark></div>')
		//	the dot must not match any character
		expect(html(highlightText('5x00', ['5.00']))).toBe('<div>5x00</div>')
	})

	it('returns the children untouched when there are no terms', () => {
		const children = <b>hello</b>
		expect(highlightText(children, [])).toBe(children)
	})

	it('ignores blank terms so they cannot match between every character', () => {
		expect(highlightText('abc', [''])).toBe('abc')
		expect(html(highlightText('abc', ['', 'b']))).toBe('<div>a<mark>b</mark>c</div>')
	})

	it('hands back the original string when nothing matches', () => {
		expect(highlightText('plain', ['zzz'])).toBe('plain')
	})

	it('walks into nested elements and keeps their props', () => {
		const result = highlightText(<p className="note">a <em>needle</em> here</p>, ['needle'])

		expect(html(result)).toBe('<div><p class="note">a <em><mark>needle</mark></em> here</p></div>')
	})

	it('walks arrays and fragments of children', () => {
		const result = highlightText(['one ', <>two one</>, <i key="i">one</i>], ['one'])

		expect(html(result)).toBe('<div><mark>one</mark> two <mark>one</mark><i><mark>one</mark></i></div>')
	})

	it('highlights inside a component element without calling it', () => {
		const result = highlightText(<Named>find me</Named>, ['find'])

		expect(isValidElement(result)).toBe(true)
		expect((result as ReactElement).type).toBe(Named)
		expect(html(result)).toBe('<div><mark>find</mark> me</div>')
	})

	it('leaves numbers, booleans and null alone', () => {
		expect(highlightText(42, ['4'])).toBe(42)
		expect(highlightText(null, ['a'])).toBeNull()
		expect(highlightText(false, ['a'])).toBe(false)
		expect(highlightText(undefined, ['a'])).toBeUndefined()
	})

	it('returns an element with no children as it is', () => {
		const empty = <hr />
		expect(highlightText(empty, ['x'])).toBe(empty)
	})

	it('does not throw on a promise child, and hands it back', () => {
		const pending = new Promise<ReactNode>(() => {})
		expect(highlightText(pending as unknown as ReactNode, ['x'])).toBe(pending)
	})

	it('renders without key warnings', () => {
		const error = jest.spyOn(console, 'error').mockImplementation(() => {})
		try {
			html(highlightText(['a b a', <span key="s">b a</span>], ['a']))
			expect(error).not.toHaveBeenCalled()
		} finally {
			error.mockRestore()
		}
	})
})
