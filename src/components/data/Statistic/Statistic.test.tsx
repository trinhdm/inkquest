import { resetVariantStyles } from '@/lib/registries'
import { resetComponentDefaults } from '@/lib/registries/componentDefaultProps'
import { renderWithTheme as render, screen } from '@/tests/test-utils'
import { Statistic } from './Statistic'

// `useCountUp` (src/hooks/useCountUp.tsx) delegates the actual tween to
// framer-motion's `animate`, which drives itself off `requestAnimationFrame`
// — unavailable in jsdom, and even polyfilled, driving a real easing curve
// deterministically is exactly the kind of "waiting on real time" the brief
// tells us to avoid. We keep every other framer-motion export real (in
// particular `useReducedMotion`, which we override per test) and only stub
// `animate` itself to synchronously report the end value, so the assertions
// below are about *our* wiring (do we call animate with the right value/
// duration, do we skip it when disabled) rather than about framer-motion's
// interpolation.
jest.mock('framer-motion', () => {
	const actual = jest.requireActual('framer-motion')
	return {
		...actual,
		animate: jest.fn((_from: number, to: number, options: { onUpdate?: (n: number) => void }) => {
			options.onUpdate?.(to)
			return { stop: jest.fn() }
		}),
		useReducedMotion: jest.fn(() => false),
	}
})

import { animate, useReducedMotion } from 'framer-motion'

describe('Statistic', () => {
	afterEach(() => {
		resetVariantStyles('Statistic')
		jest.mocked(animate).mockClear()
		jest.mocked(useReducedMotion).mockReturnValue(false)
	})

	afterAll(() => {
		resetComponentDefaults('Statistic')
	})

	it('renders the caption text alongside the value', () => {
		render(<Statistic caption="Total users" value="1,200" withinView={ false } />)
		expect(screen.getByText('Total users')).toBeInTheDocument()
	})

	it('renders a static, non-numeric value as-is without attempting to animate', () => {
		render(<Statistic caption="Status" value="—" withinView />)
		expect(screen.getByText('—')).toBeInTheDocument()
		expect(animate).not.toHaveBeenCalled()
	})

	it('shows the start-of-count value and does not call animate while out of view', () => {
		render(<Statistic caption="Users" value="1,200+" withinView={ false } />)

		// parsed prefix/suffix preserved, numeric core reset to 0 with the
		// same grouping/format framer-motion would be asked to animate to
		expect(screen.getByText('0+')).toBeInTheDocument()
		expect(animate).not.toHaveBeenCalled()
	})

	it('jumps straight to the final formatted value once in view (animate is mocked to resolve synchronously)', () => {
		render(<Statistic caption="Users" value="1,200+" withinView />)

		expect(screen.getByText('1,200+')).toBeInTheDocument()
		expect(animate).toHaveBeenCalledWith(0, 1200, expect.objectContaining({ duration: 3 }))
	})

	it('passes a custom duration through to animate in seconds', () => {
		render(<Statistic caption="Users" duration={ 5000 } value="10" withinView />)
		expect(animate).toHaveBeenCalledWith(0, 10, expect.objectContaining({ duration: 5 }))
	})

	it('does not animate when animated={false}, showing the final value immediately', () => {
		render(<Statistic animated={ false } caption="Users" value="42" withinView />)

		expect(screen.getByText('42')).toBeInTheDocument()
		expect(animate).not.toHaveBeenCalled()
	})

	it('does not animate when the user prefers reduced motion, showing the final value immediately', () => {
		jest.mocked(useReducedMotion).mockReturnValue(true)
		render(<Statistic caption="Users" value="42" withinView />)

		expect(screen.getByText('42')).toBeInTheDocument()
		expect(animate).not.toHaveBeenCalled()
	})

	it('renders an icon when one is supplied', () => {
		render(<Statistic caption="Users" icon={ <svg data-testid="stat-icon" /> } value="42" withinView={ false } />)
		expect(screen.getByTestId('stat-icon')).toBeInTheDocument()
	})
})
