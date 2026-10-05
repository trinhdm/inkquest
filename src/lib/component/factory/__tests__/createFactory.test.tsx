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
	selectors: 'root'
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

const makeWidget = () =>
	createFactory<WidgetSpecs>(
		props => <div data-testid="widget">{ props.label }{ props.children }</div>,
		{ classes, name: 'Widget' }
	)

// no default value for `classMap` — a JS default parameter also kicks in on
// an explicit `undefined` argument, which would silently defeat the
// "created without classes" test below
const makeStyledWidget = (
	classMap?: Record<string, string>,
	onTools?: (tools: unknown) => void,
) => {
	const Widget = createFactory<StyledSpecs>((props, tools) => {
		onTools?.(tools)
		const styles = tools.useStyles({ props })

		// the root selector returns pluralized keys, so read `classNames`
		return (
			<div data-testid="widget" className={ styles('root').classNames }>
				<span data-testid="icon" { ...styles('icon') } />
				{ props.label }
			</div>
		)
	}, { classes: classMap, name: 'Widget' })

	return Widget
}

describe('createFactory', () => {
	afterEach(() => resetComponentDefaults('Widget'))

	it('marks the returned component with POLYMORPHIC_MARKER', () => {
		const Widget = makeWidget()
		expect(POLYMORPHIC_MARKER in Widget).toBe(true)
	})

	it('does not expose "classes" as a property on the component — it only lives in the factory closure', () => {
		const Widget = makeWidget()
		expect('classes' in Widget).toBe(false)
	})

	it('no-ops instead of registering defaults when the factory was configured with an empty name', () => {
		const Widget = createFactory<WidgetSpecs>(
			props => <div>{ props.label }</div>,
			{ name: '' }
		)

		expect(() => Widget.set({ displayName: '', defaultProps: { label: 'x' } })).not.toThrow()
		expect(getDefaultProps<WidgetProps>('')).toEqual({})
	})

	it('registers defaults that are then readable via getDefaultProps', () => {
		const Widget = makeWidget()
		Widget.set({ defaultProps: { label: 'Default label' } })
		expect(getDefaultProps<WidgetProps>('Widget')).toEqual({ label: 'Default label' })
	})

	it('does not register anything when defaultProps is an empty object', () => {
		const Widget = makeWidget()
		Widget.set({ defaultProps: {} })
		expect(getDefaultProps<WidgetProps>('Widget')).toEqual({})
	})

	it('returns the exact args object it was called with', () => {
		const Widget = makeWidget()
		const args = { defaultProps: { label: 'Returned' } }
		expect(Widget.set(args)).toBe(args)
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
		it('passes a tools object exposing useProps, useStyles, and useVariants as the target\'s second argument', () => {
			let seen: unknown
			const Widget = makeStyledWidget(scoped, tools => { seen = tools })

			render(<Widget />, { wrapper })
			expect(seen).toEqual(
				expect.objectContaining({
					useProps: expect.any(Function),
					useStyles: expect.any(Function),
					useVariants: expect.any(Function),
				})
			)
		})

		it('forwards the factory\'s classes map into the underlying hook', () => {
			const Widget = makeStyledWidget(scoped)

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

		it('lets the per-call "name" option override the factory-level scope used for class resolution', () => {
			const Widget = createFactory<StyledSpecs>((props, { useStyles }) => {
				const styles = useStyles({ name: 'Other', props })
				return <div data-testid="widget" className={ styles('root').classNames } />
			}, { classes: scoped, name: 'Widget' })

			render(<Widget />, { wrapper })
			const root = screen.getByTestId('widget')

			// `scoped` has no `other` key, so this falls back to the kebab-cased
			// override name rather than the factory's own "widget" lookup
			expect(root).toHaveClass('other')
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

		it('builds a new tools object on every render', () => {
			const seen: unknown[] = []
			const Widget = makeStyledWidget(scoped, tools => seen.push(tools))

			// `memo` bails out on identical props, so change one to force a render
			const { rerender } = render(<Widget label="a" />, { wrapper })
			rerender(<Widget label="b" />)

			// `tooling(_props)` builds a fresh object literal on every call, so
			// `target` receives a new `tools` object each render — flagged here
			// as a performance concern (a new closure per render) worth revisiting
			expect(seen.length).toBeGreaterThan(1)
			expect(seen.at(0)).not.toBe(seen.at(-1))
		})
	})
})
