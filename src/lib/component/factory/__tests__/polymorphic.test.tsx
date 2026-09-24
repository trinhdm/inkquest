import { render, screen } from '@testing-library/react'
import { polymorphic } from '../polymorphic'
import { POLYMORPHIC_MARKER } from '../constants'

interface WidgetProps {
	label?: string
}

interface WidgetSpecs {
	props: WidgetProps
}

describe('polymorphic', () => {
	it('marks the returned component with POLYMORPHIC_MARKER and renders its output', () => {
		const Widget = polymorphic<WidgetSpecs>(props => (
			<div data-testid="widget">{ props.label }</div>
		))

		expect(POLYMORPHIC_MARKER in Widget).toBe(true)

		render(<Widget label="hi" />)
		expect(screen.getByTestId('widget')).toHaveTextContent('hi')
	})
})
