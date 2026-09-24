import { render } from '@testing-library/react'
import { VariantStyleInliner } from './VariantStyleInliner'
import { getVariantCSS } from './cache'

jest.mock('./cache', () => ({ getVariantCSS: jest.fn() }))

const mockGetVariantCSS = getVariantCSS as jest.Mock

describe('VariantStyleInliner', () => {
	// See StyleInliner.test.tsx for why assertions target `document.head`
	// and the `data-href`/`data-precedence` attributes, and why the DOM
	// assertions are collapsed into one render: React 19 hoists a
	// `<style href precedence>` out of the render tree as a "Resource" and
	// de-dupes by the hardcoded `href` for the life of the document.
	afterEach(() => {
		jest.clearAllMocks()
	})

	it('renders nothing when the resolved CSS is empty', () => {
		mockGetVariantCSS.mockReturnValue('')
		const { container } = render(<VariantStyleInliner />)

		expect(container).toBeEmptyDOMElement()
		expect(document.head.querySelector('style[data-variant-vars]')).not.toBeInTheDocument()
	})

	it('injects the exact CSS string and hoists it to head as a data-variant-vars resource', () => {
		mockGetVariantCSS.mockReturnValue('.inkq-variant { --a: 1; }')
		render(<VariantStyleInliner />)
		const style = document.head.querySelector('style[data-variant-vars]')

		expect(style?.innerHTML).toBe('.inkq-variant { --a: 1; }')
		expect(style).toHaveAttribute('data-variant-vars')
		expect(style).toHaveAttribute('data-href', 'css-variant-base')
		expect(style).toHaveAttribute('data-precedence', 'high')
	})

	it('passes names and prefix through to getVariantCSS', () => {
		mockGetVariantCSS.mockReturnValue('css')
		render(<VariantStyleInliner names={ ['solid', 'outline'] } prefix="inkq" />)

		expect(mockGetVariantCSS).toHaveBeenCalledWith(['solid', 'outline'], 'inkq')
	})
})
