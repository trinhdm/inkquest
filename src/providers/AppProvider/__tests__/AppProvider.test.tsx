import { use } from 'react'
import { render, screen } from '@testing-library/react'
import { AppProvider } from '../AppProvider'
import { ThemeContext } from '@/providers/ThemeProvider/theme.context'
import { useTheme } from '@/providers/ThemeProvider'
import { DEFAULT_THEME } from '@/providers/ThemeProvider/constants'
import { PREFIX_CSS_SELECTOR } from '@/utils/constants'
import { getSchemeCSS, getVariantCSS } from '@/components/document/StyleInliner/cache'

// `StyleInliner`/`VariantStyleInliner` resolve real, potentially large CSS
// strings and hoist `<style href precedence>` "Resource" elements that
// React de-dupes by the hardcoded `href` for the lifetime of the document
// (see StyleInliner.test.tsx) — their own CSS-generation logic is already
// covered by their unit suites. Mocking the cache module here keeps the
// real StyleInliner/VariantStyleInliner components in the tree (so their
// prop-wiring is genuinely exercised) while isolating AppProvider's own
// contract: does it merge defaults correctly and pass the right props down.
jest.mock('@/components/document/StyleInliner/cache', () => ({
	getSchemeCSS: jest.fn(() => ''),
	getVariantCSS: jest.fn(() => ''),
}))

const mockGetSchemeCSS = getSchemeCSS as jest.Mock
const mockGetVariantCSS = getVariantCSS as jest.Mock

const ContextPeeker = () => {
	const ctx = use(ThemeContext)

	return <pre data-testid="raw-config">{ JSON.stringify(ctx?.config) }</pre>
}

const PrefixConsumer = () => {
	const theme = useTheme()

	return <span data-testid="prefix">{ String(theme.prefix) }</span>
}

describe('AppProvider', () => {
	afterEach(() => {
		jest.clearAllMocks()
	})

	it('renders its children', () => {
		render(
			<AppProvider>
				<p>hello world</p>
			</AppProvider>
		)

		expect(screen.getByText('hello world')).toBeInTheDocument()
	})

	it('defaults prefix to PREFIX_CSS_SELECTOR when no prefix prop is given', () => {
		render(
			<AppProvider>
				<PrefixConsumer />
			</AppProvider>
		)

		expect(screen.getByTestId('prefix')).toHaveTextContent(PREFIX_CSS_SELECTOR)
		expect(mockGetSchemeCSS).toHaveBeenCalledWith(DEFAULT_THEME, PREFIX_CSS_SELECTOR)
		expect(mockGetVariantCSS).toHaveBeenCalledWith(undefined, PREFIX_CSS_SELECTOR)
	})

	it('lets an explicit prefix prop override the default and threads it through to both style inliners', () => {
		render(
			<AppProvider prefix="custom">
				<PrefixConsumer />
			</AppProvider>
		)

		expect(screen.getByTestId('prefix')).toHaveTextContent('custom')
		expect(mockGetSchemeCSS).toHaveBeenCalledWith(DEFAULT_THEME, 'custom')
		expect(mockGetVariantCSS).toHaveBeenCalledWith(undefined, 'custom')
	})

	it('defaults theme to DEFAULT_THEME and exposes it on ThemeContext.config when no theme prop is given', () => {
		render(
			<AppProvider>
				<ContextPeeker />
			</AppProvider>
		)

		expect(screen.getByTestId('raw-config')).toHaveTextContent(JSON.stringify(DEFAULT_THEME))
		expect(mockGetSchemeCSS).toHaveBeenCalledWith(DEFAULT_THEME, PREFIX_CSS_SELECTOR)
	})

	it('threads an explicit theme prop through to ThemeContext.config and to StyleInliner', () => {
		const customTheme = { ...DEFAULT_THEME, scale: { space: 42 } }

		render(
			<AppProvider theme={ customTheme }>
				<ContextPeeker />
			</AppProvider>
		)

		const raw = JSON.parse(screen.getByTestId('raw-config').textContent!)
		expect(raw.scale).toEqual({ space: 42 })
		expect(mockGetSchemeCSS).toHaveBeenCalledWith(customTheme, PREFIX_CSS_SELECTOR)
	})
})
