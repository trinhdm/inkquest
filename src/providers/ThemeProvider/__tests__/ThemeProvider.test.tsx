import { use } from 'react'
import { render, screen } from '@testing-library/react'
import { ThemeProvider, useTheme } from '../ThemeProvider'
import { ThemeContext } from '../theme.context'
import { DEFAULT_THEME } from '../constants'
import { tokens } from '@/lib/theme'

// Consumes the public `useTheme()` contract and renders a handful of its
// fields as text so assertions can be made through the DOM like a real
// consumer would, rather than by re-rendering a hook result directly.
const ThemeConsumer = () => {
	const theme = useTheme()

	return (
		<div>
			<span data-testid="has-config">{ String('config' in theme) }</span>
			<span data-testid="prefix">{ String(theme.prefix) }</span>
			<span data-testid="selector">{ theme.prefixSelector('Card') }</span>
		</div>
	)
}

// Reads the raw context value (a public export of this module) to inspect
// `config` directly, since `useTheme()` deliberately strips it out.
const ContextPeeker = () => {
	const ctx = use(ThemeContext)

	return <pre data-testid="raw-config">{ JSON.stringify(ctx?.config) }</pre>
}

describe('useTheme', () => {
	it('throws when called outside of a ThemeProvider', () => {
		const ThrowingConsumer = () => {
			useTheme()
			return null
		}

		// suppress the expected React error-boundary console.error noise
		const spy = jest.spyOn(console, 'error').mockImplementation(() => {})

		expect(() => render(<ThrowingConsumer />)).toThrow('missing ThemeProvider')

		spy.mockRestore()
	})
})

describe('ThemeProvider', () => {
	it('provides a context value with `config` stripped out of the public useTheme() shape', () => {
		render(
			<ThemeProvider>
				<ThemeConsumer />
			</ThemeProvider>
		)

		expect(screen.getByTestId('has-config')).toHaveTextContent('false')
	})

	it('defaults prefix to undefined and produces an unprefixed class selector when no prefix prop is given', () => {
		render(
			<ThemeProvider>
				<ThemeConsumer />
			</ThemeProvider>
		)

		expect(screen.getByTestId('prefix')).toHaveTextContent('undefined')
		expect(screen.getByTestId('selector')).toHaveTextContent('.card')
	})

	it('namespaces the prefixSelector output and exposes the given prefix when the prefix prop is set', () => {
		render(
			<ThemeProvider prefix="inkq">
				<ThemeConsumer />
			</ThemeProvider>
		)

		expect(screen.getByTestId('prefix')).toHaveTextContent('inkq')
		expect(screen.getByTestId('selector')).toHaveTextContent('.inkq-card')
	})

	it('resolves config to DEFAULT_THEME when no theme prop and no ancestor provider exist', () => {
		render(
			<ThemeProvider>
				<ContextPeeker />
			</ThemeProvider>
		)

		expect(screen.getByTestId('raw-config')).toHaveTextContent(
			JSON.stringify(DEFAULT_THEME)
		)
	})

	it('deep-merges a partial theme prop onto the inherited config instead of replacing it', () => {
		render(
			<ThemeProvider theme={ { scale: { space: 999 } } }>
				<ContextPeeker />
			</ThemeProvider>
		)

		const raw = JSON.parse(screen.getByTestId('raw-config').textContent!)

		expect(raw.scale).toEqual({ space: 999 })
		// sibling keys of DEFAULT_THEME survive the partial override
		expect(raw.colors).toEqual(DEFAULT_THEME.colors)
	})

	it('lets a nested ThemeProvider merge its own theme override on top of an ancestor provider’s resolved config, not the global default', () => {
		render(
			<ThemeProvider theme={ { scale: { space: 5 } } }>
				<ThemeProvider theme={ { fontWeight: [1, 2, 3] } }>
					<ContextPeeker />
				</ThemeProvider>
			</ThemeProvider>
		)

		const raw = JSON.parse(screen.getByTestId('raw-config').textContent!)

		// inherited from the outer provider's override
		expect(raw.scale).toEqual({ space: 5 })
		// applied by the inner provider itself
		expect(raw.fontWeight).toEqual([1, 2, 3])
	})

	it('spreads the shared design tokens into the context value alongside the theme config', () => {
		// useTheme() exposes the token fields directly (not nested under `config`)
		const TokenConsumer = () => {
			const theme = useTheme()
			return <span data-testid="token-keys">{ Object.keys(tokens).every(key => key in theme) ? 'yes' : 'no' }</span>
		}

		render(
			<ThemeProvider>
				<TokenConsumer />
			</ThemeProvider>
		)

		expect(screen.getByTestId('token-keys')).toHaveTextContent('yes')
	})
})
