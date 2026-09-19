import { render } from '@testing-library/react'
import { resetComponentDefaults } from '@/hooks/useProps'
import { resetVariantStyles } from '@/hooks/useVariants'
import { ThemeProvider } from '@/providers/ThemeProvider'
import type { ReactElement, ReactNode } from 'react'
import type { RenderOptions } from '@testing-library/react'

// `useVariants` (used by every factory component, e.g. `Button`) reads
// from `ThemeContext` and throws `missing ThemeProvider` outside of one, so
// any test that renders a factory component needs this wrapper.
const AllProviders = ({ children }: { children: ReactNode }) => (
	<ThemeProvider>{ children }</ThemeProvider>
)

const renderWithTheme = (
	ui: ReactElement,
	options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options })

// registry state is module-global and leaks between tests;
// call once at the top of a `describe` with every factory component the suite renders
const resetRegistriesFor = (...names: string[]) => {
	afterEach(() => names.forEach(resetVariantStyles))
	afterAll(() => names.forEach(resetComponentDefaults))
}

export * from '@testing-library/react'
export {
	renderWithTheme as render,
	resetRegistriesFor as reset,
}
