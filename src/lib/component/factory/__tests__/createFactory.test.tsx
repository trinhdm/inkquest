import { render, screen } from '@testing-library/react'
import { createFactory } from '../createFactory'
import { getDefaultProps, resetComponentDefaults } from '@/hooks/useProps'
import { POLYMORPHIC_MARKER } from '../constants'
import type { ReactNode } from 'react'

interface WidgetProps {
	children?: ReactNode
	label?: string
}

interface WidgetSpecs {
	props: WidgetProps
}

const classes = { root: 'widget-root' }

const makeWidget = (withClasses = true) => {
	const Widget = createFactory<WidgetSpecs>(
		props => <div data-testid="widget">{ props.label }{ props.children }</div>,
		withClasses ? classes : undefined
	)
	Widget.displayName = 'Widget'
	return Widget
}

describe('createFactory', () => {
	afterEach(() => resetComponentDefaults('Widget'))

	it('marks the returned component with POLYMORPHIC_MARKER', () => {
		const Widget = makeWidget()
		expect(POLYMORPHIC_MARKER in Widget).toBe(true)
	})

	it('stores the classes map on the component when one is passed', () => {
		const Widget = makeWidget()
		expect(Widget.classes).toBe(classes)
	})

	it('does not set a "classes" property at all when none is passed', () => {
		const Widget = makeWidget(false)
		expect(Widget.classes).toBeUndefined()
	})

	it('throws when setDefaults is called before a displayName is assigned', () => {
		const Widget = createFactory<WidgetSpecs>(props => <div>{ props.label }</div>)
		expect(() => Widget.setDefaults({ props: { label: 'x' } }))
			.toThrow('cannot set defaultProps: missing `displayName`')
	})

	it('registers defaults that are then readable via getDefaultProps', () => {
		const Widget = makeWidget()
		Widget.setDefaults({ props: { label: 'Default label' } })
		expect(getDefaultProps<WidgetProps>('Widget')).toEqual({ label: 'Default label' })
	})

	it('does not register anything when props is an empty object', () => {
		const Widget = makeWidget()
		Widget.setDefaults({ props: {} })
		expect(getDefaultProps<WidgetProps>('Widget')).toEqual({})
	})

	it('returns the exact args object it was called with', () => {
		const Widget = makeWidget()
		const args = { props: { label: 'Returned' } }
		expect(Widget.setDefaults(args)).toBe(args)
	})

	describe('withProps', () => {
		it('sets a "WithProps(<Name>)" displayName', () => {
			const Widget = makeWidget()
			const Bound = Widget.withProps({ label: 'bound' })
			expect(Bound.displayName).toBe('WithProps(Widget)')
		})

		it('lets a call-site prop win over the bound one', () => {
			const Widget = makeWidget()
			const Bound = Widget.withProps({ label: 'bound' })

			render(<Bound label="override" />)
			expect(screen.getByTestId('widget')).toHaveTextContent('override')
		})

		it('falls back to the bound prop when the call site does not override it', () => {
			const Widget = makeWidget()
			const Bound = Widget.withProps({ label: 'bound' })

			render(<Bound />)
			expect(screen.getByTestId('widget')).toHaveTextContent('bound')
		})
	})
})
