import { render, screen } from '@testing-library/react'
import { definePolymorphic } from '../definePolymorphic'

interface WidgetProps {
	label?: string
}

describe('definePolymorphic', () => {
	it('passes props straight through to the wrapped render function', () => {
		const Widget = definePolymorphic<WidgetProps, 'div'>(props => (
			<div data-testid="widget">{ props.label }</div>
		))

		render(<Widget label="hello" />)
		expect(screen.getByTestId('widget')).toHaveTextContent('hello')
	})
})
