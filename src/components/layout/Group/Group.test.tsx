import { createContext, useContext } from 'react'
import { getDefaultProps } from '@/hooks/useProps'
import { render, reset, screen } from '@/tests/test-utils'
import { Group } from './Group'
import type { RootProviderFn } from '@/lib/component'

// A plain, library-external component with its own `displayName` — the
// contract `Group`'s `childName` filters against (`filterChildren(children,
// childName)`, keyed off `child.type.displayName`). `Group` doesn't ship its
// own item subcomponent; any consumer-supplied component works.
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
		>
			{ label }
		</div>
	)
}
DebugItem.displayName = 'DebugItem'

describe('Group', () => {
	reset('Group')

	it('registers childName, divider, and provider as its own defaults', () => {
		// Read from `Group.tsx`'s own `Group.setDefaults({...})` call, rather
		// than hand-typing a guess at what it registers.
		const defaults = getDefaultProps<Group.Props & { provider?: RootProviderFn<Group.Context> }>('Group')

		expect(defaults).toEqual({
			childName: 'Group.Item',
			divider: true,
			provider: expect.any(Function),
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

	it('keeps only children whose displayName matches childName, and keeps bare strings unconditionally', () => {
		render(
			<Group childName="GroupItem">
				<GroupItem label="Kept 1" />
				<OtherItem label="Dropped (wrong displayName)" />
				<div>Dropped (host element, no displayName)</div>
				{ 'Kept (plain string, not an element)' }
				<GroupItem label="Kept 2" />
			</Group>
		)

		expect(screen.getByText('Kept 1')).toBeInTheDocument()
		expect(screen.getByText('Kept 2')).toBeInTheDocument()
		expect(screen.getByText('Kept (plain string, not an element)')).toBeInTheDocument()
		expect(screen.queryByText('Dropped (wrong displayName)')).not.toBeInTheDocument()
		expect(screen.queryByText('Dropped (host element, no displayName)')).not.toBeInTheDocument()
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

	// `columns` feeds `--group-cols` as an inline CSS custom property via
	// `setThemeCSS`'s `tokens` (see `Group.tsx`), not a class — `style` IS
	// assertable in Jest, unlike CSS-module classes.
	it('sets the --group-cols custom property only when columns is provided', () => {
		const { rerender } = render(
			<Group childName="GroupItem" columns={ 3 }>
				<GroupItem label="Item" />
			</Group>
		)
		expect(screen.getByRole('group').style.getPropertyValue('--group-cols')).toBe('3')

		rerender(<Group childName="GroupItem"><GroupItem label="Item" /></Group>)
		expect(screen.getByRole('group').style.getPropertyValue('--group-cols')).toBe('')
	})

	it('publishes no context at all when no provider is given (children render unwrapped)', () => {
		// Without `provider`, `renderWithProvider` wraps each filtered child in
		// a bare `Fragment` — there is no context to read, so a plain child
		// renders exactly as authored.
		render(
			<Group childName="GroupItem">
				<GroupItem label="Unwrapped item" />
			</Group>
		)
		expect(screen.getByText('Unwrapped item')).toBeInTheDocument()
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
})
