import { render, reset, screen } from '@/tests/test-utils'
import { Statistic } from '../Statistic'
import { StatisticGroup } from './StatisticGroup'

// Same rationale as Statistic.test.tsx: stub framer-motion's `animate` so
// group-inherited `duration`/`animated`/`stagger` values are asserted via
// the call framer-motion receives, not via a real, timing-dependent tween.
// `Group` (src/components/layout/Group) also calls `useInView` unconditionally
// on mount; jest.setup.ts stubs `IntersectionObserver` so that settles to
// `false` and never fires — every Statistic here is driven via the explicit
// `withinView` prop it inherits from `StatisticGroup`'s Group.Context wiring.
jest.mock('framer-motion', () => {
	const actual = jest.requireActual('framer-motion')
	return {
		...actual,
		animate: jest.fn((_from: number, to: number, options: { onUpdate?: (n: number) => void }) => {
			options.onUpdate?.(to)
			return { stop: jest.fn() }
		}),
	}
})

import { animate } from 'framer-motion'

describe('StatisticGroup', () => {
	reset('StatisticGroup', 'Statistic')

	afterEach(() => {
		jest.mocked(animate).mockClear()
	})

	it('renders as an accessible group and renders each Statistic child', () => {
		render(
			<StatisticGroup>
				<Statistic caption="Users" value="10" />
				<Statistic caption="Orders" value="20" />
			</StatisticGroup>
		)

		expect(screen.getByRole('group')).toBeInTheDocument()
		expect(screen.getByText('Users')).toBeInTheDocument()
		expect(screen.getByText('Orders')).toBeInTheDocument()
	})

	it('drops children that are not Statistic instances', () => {
		render(
			<StatisticGroup>
				<Statistic caption="Users" value="10" />
				<div>not a statistic</div>
			</StatisticGroup>
		)

		expect(screen.queryByText('not a statistic')).not.toBeInTheDocument()
	})

	// group defaults (from `StatisticGroup.setDefaults`) leave `withinView`
	// as `false` (the stubbed IntersectionObserver never fires), so children
	// stay pinned at their un-animated start value and `animate` is never called
	it('does not animate its children while the group itself is not in view', () => {
		render(
			<StatisticGroup>
				<Statistic caption="Users" value="1,000" />
			</StatisticGroup>
		)

		expect(screen.getByText('0')).toBeInTheDocument()
		expect(animate).not.toHaveBeenCalled()
	})

	it('a child Statistic overrides the group-inherited duration with its own explicit prop', () => {
		render(
			<StatisticGroup duration={ 3000 }>
				<Statistic duration={ 7000 } value="9" withinView />
				<Statistic value="4" withinView />
			</StatisticGroup>
		)

		expect(animate).toHaveBeenCalledWith(0, 9, expect.objectContaining({ duration: 7 }))
		expect(animate).toHaveBeenCalledWith(0, 4, expect.objectContaining({ duration: 3 }))
	})

	it('a child Statistic overrides group animated=true by explicitly passing animated={false}', () => {
		render(
			<StatisticGroup>
				<Statistic animated={ false } value="5" withinView />
			</StatisticGroup>
		)

		expect(screen.getByText('5')).toBeInTheDocument()
		expect(animate).not.toHaveBeenCalled()
	})

	it('staggers each child\'s animation delay by its index * the group stagger, in seconds', () => {
		render(
			<StatisticGroup stagger={ 100 }>
				<Statistic value="1" withinView />
				<Statistic value="2" withinView />
			</StatisticGroup>
		)

		expect(animate).toHaveBeenNthCalledWith(1, 0, 1, expect.not.objectContaining({ delay: expect.anything() }))
		expect(animate).toHaveBeenNthCalledWith(2, 0, 2, expect.objectContaining({ delay: 0.1 }))
	})
})
