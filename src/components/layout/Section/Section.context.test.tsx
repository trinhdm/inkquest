import { renderHook } from '@testing-library/react'
import { Grid } from '../Grid'
import { SectionProvider, useChosenSectionProps, type SectionContext } from './Section.context'
import type { ReactNode } from 'react'

const withSection = (value: SectionContext) =>
	({ children }: { children: ReactNode }) => (
		<SectionProvider value={ value }>{ children }</SectionProvider>
	)

describe('useChosenSectionProps', () => {
	it('fills revealFrom, size and unstyled from the Section context', () => {
		const { result } = renderHook(
			() => useChosenSectionProps({} as { revealFrom?: number, size?: 'sm' | 'md' | 'lg', unstyled?: boolean }),
			{ wrapper: withSection({ revealFrom: 2, size: 'lg', unstyled: true }) }
		)

		expect(result.current).toEqual({ revealFrom: 2, size: 'lg', unstyled: true })
	})

	it('lets an explicit own prop win over the context value', () => {
		const { result } = renderHook(
			() => useChosenSectionProps({ size: 'sm' } as { size?: 'sm' | 'md' | 'lg', unstyled?: boolean }),
			{ wrapper: withSection({ size: 'lg', unstyled: true }) }
		)

		expect(result.current).toEqual({ size: 'sm', unstyled: true })
	})

	it('does not inherit the footer-only `as` and `span` context keys', () => {
		const { result } = renderHook(
			() => useChosenSectionProps({} as { as?: unknown, size?: 'sm' | 'md' | 'lg', span?: unknown }),
			{ wrapper: withSection({ as: Grid.Item, size: 'md', span: 3 }) }
		)

		// positive control: a chosen key from the same context is inherited
		expect(result.current).toEqual({ size: 'md' })
		expect(result.current).not.toHaveProperty('as')
		expect(result.current).not.toHaveProperty('span')
	})

	it('returns the props untouched outside a Section', () => {
		const props = { size: 'sm' as const }
		const { result } = renderHook(() => useChosenSectionProps(props))

		expect(result.current).toBe(props)
	})
})
