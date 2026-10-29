import { createContext, useContext } from 'react'
import { getDefaultProps } from '@/hooks/useProps'
import { render, reset, screen } from '@/tests/test-utils'
import { act } from 'react'
import { extractOthers } from '@/hooks/useProps'
import { Group, GROUP_CASCADE_PROPS } from './Group'
import type { RootProviderFn } from '@/lib/component/context'

// A plain, library-external component with its own `displayName` — the
// contract `Group`'s `childName` filters against (`filterChildren(children,
// childName)`, keyed off `child.type.displayName`). `Group` ships its own
// `Group.Item` (the default `childName`), but `childName` accepts any
// consumer-supplied component, which is what these stand-ins exercise.
const GroupItem = ({ label }: { label: string }) => <div>{ label }</div>
GroupItem.displayName = 'GroupItem'

const OtherItem = ({ label }: { label: string }) => <div>{ label }</div>
OtherItem.displayName = 'OtherItem'

// Stands in for a real `RootProviderFn` consumer (e.g. `StatisticGroup`'s
// own provider) — exposes each child's published context value back out as
// inspectable `data-*` attributes, since none of `animated`/`duration`/
// `stagger`/`unstyled` have any DOM effect of Group's own.
const DebugContext = createContext<Group.Context | null>(null)

const DebugProvider: RootProviderFn<Group.Context> = ({ children, value }) => (
	<DebugContext value={ value }>{ children }</DebugContext>
)

const DebugItem = ({ label }: { label: string }) => {
	const ctx = useContext(DebugContext)

	return (
		<div
			data-index={ ctx?.index }
			data-animated={ String(!!ctx?.animated) }
			data-duration={ ctx?.duration }
			data-stagger={ ctx?.stagger }
			data-unstyled={ String(!!ctx?.unstyled) }
			data-within-view={ String(ctx?.withinView) }
		>
			{ label }
		</div>
	)
}
DebugItem.displayName = 'DebugItem'

describe('Group', () => {
	reset('Group', 'Group.Item')

	it('registers childName, divider, and provider as its own defaults', () => {
		// Read from `Group.tsx`'s own `Group.set({ defaultProps })` call, rather
		// than hand-typing a guess at what it registers.
		const defaults = getDefaultProps<
			Group.Props & { provider?: RootProviderFn<Group.Context> }
		>('Group')

		expect(defaults).toEqual({
			as: 'div',
			childName: 'Group.Item',
			divider: false,
			provider: expect.any(Function),
			values: {},
		})
	})

	it('renders as an accessible group', () => {
		render(
			<Group childName="GroupItem">
				<GroupItem label="Item 1" />
			</Group>
		)
		expect(screen.getByRole('group')).toBeInTheDocument()
	})

	// Group renders only children that match `childName`. Everything else - other
	// components, host elements, text - is dropped, and named in a dev warning.
	describe('child filtering', () => {
		let warn: jest.SpyInstance

		beforeEach(() => { warn = jest.spyOn(console, 'warn').mockImplementation(() => {}) })
		afterEach(() => { warn.mockRestore() })

		it('stays silent when every child matches childName', () => {
			render(
				<Group childName="GroupItem">
					<GroupItem label="Item 1" />
					<GroupItem label="Item 2" />
				</Group>
			)

			expect(screen.getByText('Item 2')).toBeInTheDocument()
			expect(warn).not.toHaveBeenCalled()
		})

		it('keeps only children whose displayName matches childName, and warns about the rest', () => {
			render(
				<Group childName="GroupItem">
					<GroupItem label="Kept 1" />
					<OtherItem label="Dropped (wrong displayName)" />
					<div>Dropped (host element, no displayName)</div>
					<GroupItem label="Kept 2" />
				</Group>
			)

			expect(screen.getByText('Kept 1')).toBeInTheDocument()
			expect(screen.getByText('Kept 2')).toBeInTheDocument()
			expect(screen.queryByText('Dropped (wrong displayName)')).not.toBeInTheDocument()
			expect(screen.queryByText('Dropped (host element, no displayName)')).not.toBeInTheDocument()
			expect(warn).toHaveBeenCalledWith('Group: ignoring unrelated OtherItem, <div>.')
		})

		it('drops bare string and number children, keeping the matching element beside them, and warns about them', () => {
			render(
				<Group childName="GroupItem">
					<GroupItem label="Kept" />
					{ 'Plain string, not an element' }
					{ 42 }
				</Group>
			)

			expect(screen.getByText('Kept')).toBeInTheDocument()
			expect(screen.queryByText('Plain string, not an element')).not.toBeInTheDocument()
			expect(screen.queryByText('42')).not.toBeInTheDocument()
			expect(warn).toHaveBeenCalledWith('Group: ignoring unrelated Plain string, not an element, text \'42\'.')
		})
	})

	it('reflects orientation as aria-orientation, and omits it entirely when unset', () => {
		const { rerender } = render(
			<Group childName="GroupItem" orientation="horizontal">
				<GroupItem label="Item" />
			</Group>
		)
		expect(screen.getByRole('group')).toHaveAttribute('aria-orientation', 'horizontal')

		rerender(<Group childName="GroupItem"><GroupItem label="Item" /></Group>)
		expect(screen.getByRole('group')).not.toHaveAttribute('aria-orientation')
	})

	it('adds data-block only when fullWidth is set', () => {
		const { rerender } = render(
			<Group childName="GroupItem" fullWidth>
				<GroupItem label="Item" />
			</Group>
		)
		expect(screen.getByRole('group')).toHaveAttribute('data-block')

		rerender(<Group childName="GroupItem"><GroupItem label="Item" /></Group>)
		expect(screen.getByRole('group')).not.toHaveAttribute('data-block')
	})

	// `columns` feeds `--group-item-count` as an inline CSS custom property
	// via `defineTokens`' `tokens` (see `Group.tsx`), not a class — `style`
	// IS assertable in Jest, unlike CSS-module classes.
	it('sets the --group-item-count custom property only when columns is provided', () => {
		const { rerender } = render(
			<Group childName="GroupItem" columns={ 3 }>
				<GroupItem label="Item" />
			</Group>
		)
		expect(screen.getByRole('group').style.getPropertyValue('--group-item-count')).toBe('3')

		rerender(<Group childName="GroupItem"><GroupItem label="Item" /></Group>)
		expect(screen.getByRole('group').style.getPropertyValue('--group-item-count')).toBe('')
	})

	// When `orientation` is set and `columns` is not, `--group-item-count`
	// derives from `Children.count` instead: `count - 1` once there's more
	// than one child (`Group.tsx`'s `tokens` callback), else `count` itself.
	it('derives --group-item-count from child count minus one when orientation is set with more than one child and no columns', () => {
		render(
			<Group childName="GroupItem" orientation="horizontal">
				<GroupItem label="One" />
				<GroupItem label="Two" />
				<GroupItem label="Three" />
			</Group>
		)
		expect(screen.getByRole('group').style.getPropertyValue('--group-item-count')).toBe('2')
	})

	it('derives --group-item-count from the child count itself when orientation is set with a single child and no columns', () => {
		render(
			<Group childName="GroupItem" orientation="horizontal">
				<GroupItem label="Only" />
			</Group>
		)
		expect(screen.getByRole('group').style.getPropertyValue('--group-item-count')).toBe('1')
	})

	// `GroupProvider` is the registered default `provider`, so the built-in
	// `Group.Item` can read its context without any `provider` prop.
	it('wraps each Group.Item in the default GroupProvider, so the item renders inside the group', () => {
		render(
			<Group>
				<Group.Item>Default item</Group.Item>
			</Group>
		)

		expect(screen.getByRole('group')).toContainElement(screen.getByText('Default item'))
	})

	it('publishes a per-child context value (index, animated, duration, stagger) via the provider prop', () => {
		render(
			<Group childName="DebugItem" provider={ DebugProvider } animated duration={ 600 } stagger={ 100 }>
				<DebugItem label="Item 1" />
				<DebugItem label="Item 2" />
			</Group>
		)

		const item1 = screen.getByText('Item 1'),
			item2 = screen.getByText('Item 2')

		expect(item1).toHaveAttribute('data-index', '0')
		expect(item1).toHaveAttribute('data-animated', 'true')
		expect(item1).toHaveAttribute('data-duration', '600')
		expect(item2).toHaveAttribute('data-index', '1')
		expect(item2).toHaveAttribute('data-stagger', '100')
	})

	describe('unstyled precedence in the published context', () => {
		const renderWith = (groupProps: Record<string, unknown>) =>
			render(
				<Group childName="DebugItem" provider={ DebugProvider } { ...groupProps }>
					<DebugItem label="Item 1" />
					<DebugItem label="Item 2" />
				</Group>
			)

		it('publishes unstyled=false to every child when neither the group nor values set it', () => {
			renderWith({})

			expect(screen.getByText('Item 1')).toHaveAttribute('data-unstyled', 'false')
			expect(screen.getByText('Item 2')).toHaveAttribute('data-unstyled', 'false')
		})

		it('forwards the group\'s own unstyled prop to every child', () => {
			renderWith({ unstyled: true })

			expect(screen.getByText('Item 1')).toHaveAttribute('data-unstyled', 'true')
			expect(screen.getByText('Item 2')).toHaveAttribute('data-unstyled', 'true')
		})

		it('publishes unstyled=true from values when the group itself is styled', () => {
			renderWith({ values: { unstyled: true } })

			expect(screen.getByText('Item 1')).toHaveAttribute('data-unstyled', 'true')
		})

		it('lets values.unstyled=true win over an explicit unstyled={ false } on the group', () => {
			renderWith({ unstyled: false, values: { unstyled: true } })

			expect(screen.getByText('Item 1')).toHaveAttribute('data-unstyled', 'true')
			expect(screen.getByText('Item 2')).toHaveAttribute('data-unstyled', 'true')
		})

		it('still spreads the other values into the context alongside unstyled', () => {
			renderWith({ values: { duration: 321, unstyled: true } })

			expect(screen.getByText('Item 1')).toHaveAttribute('data-duration', '321')
			expect(screen.getByText('Item 1')).toHaveAttribute('data-unstyled', 'true')
		})
	})

	describe('header', () => {
		it('renders the header before the items, inside the group', () => {
			render(
				<Group childName="GroupItem" header={ <h2>Group heading</h2> }>
					<GroupItem label="Item 1" />
				</Group>
			)

			const group = screen.getByRole('group'),
				heading = screen.getByRole('heading', { name: 'Group heading' })

			expect(group).toContainElement(heading)
			expect(heading.compareDocumentPosition(screen.getByText('Item 1')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
		})

		it('keeps the header out of the child filtering, so it never triggers a warning', () => {
			const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})

			try {
				render(
					<Group childName="GroupItem" header={ <legend>Legend</legend> }>
						<GroupItem label="Item 1" />
					</Group>
				)

				expect(screen.getByText('Legend')).toBeInTheDocument()
				expect(warn).not.toHaveBeenCalled()
			} finally {
				warn.mockRestore()
			}
		})
	})

	describe('justify', () => {
		it('publishes justify as the --group-justify custom property only when set', () => {
			const { rerender } = render(
				<Group childName="GroupItem" justify="center">
					<GroupItem label="Item" />
				</Group>
			)
			expect(screen.getByRole('group').style.getPropertyValue('--group-justify')).toBe('center')

			rerender(<Group childName="GroupItem"><GroupItem label="Item" /></Group>)
			expect(screen.getByRole('group').style.getPropertyValue('--group-justify')).toBe('')
		})
	})

	describe('role', () => {
		it('adds role="group" to a div root (positive control)', () => {
			const { container } = render(
				<Group childName="GroupItem"><GroupItem label="Item" /></Group>
			)

			expect(container.firstElementChild).toHaveAttribute('role', 'group')
		})

		it.each(['fieldset', 'hgroup'] as const)('adds no role attribute to a %s, which already has its own semantics', tag => {
			const { container } = render(
				<Group as={ tag } childName="GroupItem"><GroupItem label="Item" /></Group>
			)

			expect(container.firstElementChild?.tagName.toLowerCase()).toBe(tag)
			expect(container.firstElementChild).not.toHaveAttribute('role')
		})
	})

	describe('GROUP_CASCADE_PROPS', () => {
		it('lets the cascade props through extractOthers, while still dropping the other reserved ones', () => {
			const rest = {
				animated: true, duration: 300, once: true, stagger: 50,
				revealFrom: 2, withinView: true,
				className: 'x', 'data-kept': 'yes',
			}

			const kept = extractOthers(rest, GROUP_CASCADE_PROPS)
			expect(kept).toMatchObject({
				animated: true, duration: 300, once: true, stagger: 50,
				revealFrom: 2, withinView: true, 'data-kept': 'yes',
			})
			expect(kept).not.toHaveProperty('className')

			// positive control: without the list, the same props are stripped
			const stripped = extractOthers(rest)
			expect(stripped).not.toHaveProperty('duration')
			expect(stripped).toHaveProperty('data-kept', 'yes')
		})

		it('does not leak the cascade props onto the group element', () => {
			render(
				<Group childName="GroupItem" animated duration={ 300 } stagger={ 50 }>
					<GroupItem label="Item" />
				</Group>
			)

			const group = screen.getByRole('group')
			expect(group).not.toHaveAttribute('animated')
			expect(group).not.toHaveAttribute('duration')
			expect(group).not.toHaveAttribute('stagger')
		})
	})

	describe('withinView in the published context', () => {
		const renderDebug = () =>
			render(
				<Group childName="DebugItem" provider={ DebugProvider }>
					<DebugItem label="Item 1" />
					<DebugItem label="Item 2" />
				</Group>
			)

		it('publishes withinView=false to every child while the group is off screen', () => {
			renderDebug()

			expect(screen.getByText('Item 1')).toHaveAttribute('data-within-view', 'false')
			expect(screen.getByText('Item 2')).toHaveAttribute('data-within-view', 'false')
		})

		it('publishes withinView=true to every child once the group scrolls into view', () => {
			const callbacks: IntersectionObserverCallback[] = []
			const original = global.IntersectionObserver

			class CapturingObserver {
				constructor(callback: IntersectionObserverCallback) { callbacks.push(callback) }
				observe = jest.fn()
				unobserve = jest.fn()
				disconnect = jest.fn()
				takeRecords = jest.fn(() => [])
			}

			Object.defineProperty(global, 'IntersectionObserver', { configurable: true, writable: true, value: CapturingObserver })

			try {
				renderDebug()
				expect(callbacks.length).toBeGreaterThan(0)

				const target = screen.getByRole('group')
				act(() => {
					for (const callback of callbacks) {
						callback(
							[{ isIntersecting: true, target, intersectionRatio: 1 } as unknown as IntersectionObserverEntry],
							{} as IntersectionObserver
						)
					}
				})

				expect(screen.getByText('Item 1')).toHaveAttribute('data-within-view', 'true')
				expect(screen.getByText('Item 2')).toHaveAttribute('data-within-view', 'true')
			} finally {
				Object.defineProperty(global, 'IntersectionObserver', { configurable: true, writable: true, value: original })
			}
		})
	})
})
