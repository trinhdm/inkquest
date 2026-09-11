import { render } from '@testing-library/react'
import { ThemeProvider } from '@/providers/ThemeProvider'
import type { ReactElement, ReactNode } from 'react'
import type { RenderOptions } from '@testing-library/react'

// `useVariantStyles` (used by every factory component, e.g. `Button`) reads
// from `ThemeContext` and throws `missing ThemeProvider` outside of one, so
// any test that renders a factory component needs this wrapper.
const AllProviders = ({ children }: { children: ReactNode }) => (
	<ThemeProvider>{ children }</ThemeProvider>
)

export const renderWithTheme = (
	ui: ReactElement,
	options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options })

export * from '@testing-library/react'
