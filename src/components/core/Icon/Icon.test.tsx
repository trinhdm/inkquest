import { getDefaultProps } from '@/hooks/useProps'
import { render, reset } from '@/tests/test-utils'
import { Icon } from './Icon'

describe('Icon', () => {
	reset('Icon')

	it('renders the svg for a mapped icon type', () => {
		const { container } = render(<Icon type="close" />)
		expect(container.querySelector('svg')).toBeInTheDocument()
	})

	it('applies the registered default tag and size', () => {
		// `as` is registered in the defaults registry at runtime, but it's
		// declared on the component's Specs rather than its Props — widen the
		// generic to match what `setDefaults` actually stored.
		const defaults = getDefaultProps<
			Icon.Props & Pick<Icon.Specs['defaults'], 'as'>
		>('Icon')
		const { container } = render(<Icon type="close" />)
		const svg = container.querySelector('svg')

		expect(svg?.tagName.toLowerCase()).toBe(defaults.as)
		// lucide-react renders `size` as both a `width` and `height` attribute
		expect(svg).toHaveAttribute('width', `${defaults.size}`)
		expect(svg).toHaveAttribute('height', `${defaults.size}`)
	})

	it('respects an explicit size override', () => {
		const { container } = render(<Icon type="close" size={ 32 } />)
		const svg = container.querySelector('svg')

		expect(svg).toHaveAttribute('width', '32')
		expect(svg).toHaveAttribute('height', '32')
	})

	it('sets fill to currentColor when filled is true', () => {
		const { container } = render(<Icon type="like" filled />)
		expect(container.querySelector('svg')).toHaveAttribute('fill', 'currentColor')
	})

	it('does not set a fill attribute when filled is unset', () => {
		const { container } = render(<Icon type="like" />)
		expect(container.querySelector('svg')).not.toHaveAttribute('fill')
	})

	it('passes through color and strokeWidth to the underlying lucide icon', () => {
		const { container } = render(<Icon type="close" color="red" strokeWidth={ 3 } />)
		const svg = container.querySelector('svg')

		expect(svg).toHaveAttribute('stroke', 'red')
		expect(svg).toHaveAttribute('stroke-width', '3')
	})

	it('renders nothing for an unknown icon type', () => {
		// `ICON_MAP[type]` is undefined for anything outside `IconType`; the
		// component returns `null` rather than throwing. Cast is required since
		// `IconType` is a closed union — this exercises the runtime guard for a
		// value that could slip through at a JS call site or from unvalidated data.
		const { container } = render(<Icon type={ 'not-a-real-icon' as Icon.Props['type'] } />)
		expect(container).toBeEmptyDOMElement()
	})
})
