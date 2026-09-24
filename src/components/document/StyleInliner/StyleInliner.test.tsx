import { render } from '@testing-library/react'
import { StyleInliner } from './StyleInliner'
import { getSchemeCSS } from './cache'
import type { SiteTheme } from '@/lib/theme'

jest.mock('./cache', () => ({ getSchemeCSS: jest.fn() }))

const mockGetSchemeCSS = getSchemeCSS as jest.Mock
const theme = {} as SiteTheme

describe('StyleInliner', () => {
	// React 19 treats a `<style href precedence>` element as a hoistable
	// "Resource" (see AGENTS.md — this Next.js/React version has breaking
	// changes from training-data assumptions): it is never rendered inline
	// in the render `container`, it is hoisted into `document.head`, and
	// React renames `href`/`precedence` to `data-href`/`data-precedence` on
	// the underlying DOM node while dropping the raw `href`/`precedence`
	// attributes entirely. Assertions below target `document.head` and the
	// renamed attributes accordingly — verified empirically, not assumed.
	//
	// React also de-dupes style resources by `href` for the lifetime of the
	// document (it won't re-insert a resource it believes is already
	// installed, even after the DOM node is manually removed) — since
	// `href="css-scheme-base"` is a hardcoded constant in the source, every
	// test in this file shares one dedup slot. So the DOM-asserting cases
	// below are collapsed into a single render/assertion to avoid a
	// second render silently no-opping.
	afterEach(() => {
		jest.clearAllMocks()
	})

	it('renders nothing when the resolved CSS is empty', () => {
		mockGetSchemeCSS.mockReturnValue('')
		const { container } = render(<StyleInliner theme={ theme } />)

		expect(container).toBeEmptyDOMElement()
		expect(document.head.querySelector('style[data-scheme-style]')).not.toBeInTheDocument()
	})

	it('injects the exact CSS string and hoists it to head as a data-scheme-style resource', () => {
		mockGetSchemeCSS.mockReturnValue(':root { --a: 1; }')
		render(<StyleInliner theme={ theme } />)
		const style = document.head.querySelector('style[data-scheme-style]')

		expect(style?.innerHTML).toBe(':root { --a: 1; }')
		expect(style).toHaveAttribute('data-scheme-style')
		expect(style).toHaveAttribute('data-href', 'css-scheme-base')
		expect(style).toHaveAttribute('data-precedence', 'high')
	})

	it('passes theme and prefix through to getSchemeCSS', () => {
		mockGetSchemeCSS.mockReturnValue('css')
		render(<StyleInliner theme={ theme } prefix="inkq" />)

		expect(mockGetSchemeCSS).toHaveBeenCalledWith(theme, 'inkq')
	})
})
