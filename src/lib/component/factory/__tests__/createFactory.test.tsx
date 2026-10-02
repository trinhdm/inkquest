import { render, screen } from '@testing-library/react'
import { createFactory } from '../createFactory'
import { getDefaultProps, resetComponentDefaults } from '@/hooks/useProps'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { POLYMORPHIC_MARKER } from '../constants'
import type { ReactNode } from 'react'

interface WidgetProps {
	children?: ReactNode
	label?: string
}

interface WidgetSpecs {
	props: WidgetProps
}

// a second spec that declares selectors, so `styles()` is exercised against a
// real selector union rather than the `string` fallback
interface StyledSpecs {
	props: WidgetProps
	selectors: 'root' | 'icon'
}

// `getClassName` resolves its CSS-module lookup key from the kebab-cased
// component NAME (plus `__<selector>` for non-root selectors) — not from the
// selector alone. These are the keys a real `*.module.scss` import exposes.
const classes = { widget: 'widget-root' }

const scoped = {
	widget: 'scoped-widget-root',
	widget__icon: 'scoped-widget-icon',
}

const wrapper = ({ children }: { children: ReactNode }) => (
	<ThemeProvider>{ children }</ThemeProvider>
)

const makeWidget = (withClasses = true) => {
	const Widget = createFactory<WidgetSpecs>(
		props => <div data-testid="widget">{ props.label }{ props.children }</div>,
		withClasses ? classes : undefined
	)
	Widget.displayName = 'Widget'
	return Widget
}

const makeStyledWidget = (
	classMap: Record<string, string> | undefined = scoped,
	onTools?: (tools: unknown) => void,
) => {
	const Widget = createFactory<StyledSpecs>((props, tools) => {
		onTools?.(tools)
		const styles = tools.useStyles('Widget', { props })

		// the root selector returns pluralized keys, so read `classNames`
		return (
			<div data-testid="widget" className={ styles('root').classNames }>
				<span data-testid="icon" { ...styles('icon') } />
				{ props.label }
			</div>
		)
	}, classMap)

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

	describe('injected tools.useStyles', () => {
		it('passes a tools object exposing useStyles as the target\'s second argument', () => {
			let seen: unknown
			const Widget = makeStyledWidget(scoped, tools => { seen = tools })

			render(<Widget />, { wrapper })
			expect(seen).toEqual(
				expect.objectContaining({ useStyles: expect.any(Function) })
			)
		})

		it('forwards the factory\'s classes map into the underlying hook', () => {
			const Widget = makeStyledWidget()

			render(<Widget />, { wrapper })
			expect(screen.getByTestId('widget')).toHaveClass('scoped-widget-root')
			expect(screen.getByTestId('icon')).toHaveClass('scoped-widget-icon')
		})

		it('still emits the semantic class when the factory was created without classes', () => {
			const Widget = makeStyledWidget(undefined)

			render(<Widget />, { wrapper })
			const root = screen.getByTestId('widget')

			expect(root).toHaveClass('widget')
			expect(root).not.toHaveClass('scoped-widget-root')
		})

		// guards the closure in `createFactory`: `classes` is captured once per
		// factory call, so two factories must not see each other's map
		it('does not leak one factory\'s classes into another', () => {
			const First = makeStyledWidget({ widget: 'from-first' })
			const Second = makeStyledWidget({ widget: 'from-second' })

			render(<><First /><Second /></>, { wrapper })
			const [first, second] = screen.getAllByTestId('widget')

			expect(first).toHaveClass('from-first')
			expect(first).not.toHaveClass('from-second')
			expect(second).toHaveClass('from-second')
		})

		it('reuses the same tools object across re-renders', () => {
			const seen: unknown[] = []
			const Widget = makeStyledWidget(scoped, tools => seen.push(tools))

			// `memo` bails out on identical props, so change one to force a render
			const { rerender } = render(<Widget label="a" />, { wrapper })
			rerender(<Widget label="b" />)

			expect(seen.length).toBeGreaterThan(1)
			expect(seen.at(0)).toBe(seen.at(-1))
		})
	})
})
