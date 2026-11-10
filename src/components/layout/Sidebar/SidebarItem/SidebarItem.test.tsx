import userEvent from '@testing-library/user-event'
import { RouterContext } from 'next/dist/shared/lib/router-context.shared-runtime'
import { render as renderWithTheme, reset, screen } from '@/tests/test-utils'
import { Sidebar } from '../Sidebar'
import type { ReactElement } from 'react'
import type { NextRouter } from 'next/router'

// under Jest `next/link` resolves to the build that only runs `onNavigate` (and
// then navigates through `router.push`) once a router is in context
const router = {
	prefetch: jest.fn(() => Promise.resolve()),
	push: jest.fn(),
	replace: jest.fn(),
} as unknown as NextRouter

const render = (ui: ReactElement) => renderWithTheme(
	<RouterContext value={ router }>{ ui }</RouterContext>
)

describe('Sidebar.Item', () => {
	reset('Sidebar', 'Button')

	const linkItems: Sidebar.Item.Link[] = [
		{ id: 'overview', label: 'Overview', url: '/profile' },
		{ id: 'settings', label: 'Settings', url: '/settings' },
	]

	const actionItems: Sidebar.Item.Action[] = [
		{ id: 'save', label: 'Save' },
		{ id: 'discard', label: 'Discard' },
	]

	let pushState: jest.SpyInstance

	beforeEach(() => {
		pushState = jest.spyOn(window.history, 'pushState').mockImplementation(() => {})
	})

	afterEach(() => {
		pushState.mockRestore()
		jest.mocked(router.push).mockClear()
	})

	it('throws when rendered outside of a Sidebar', () => {
		const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})

		expect(() => render(<Sidebar.Item id="a" label="A" />))
			.toThrow('Sidebar: <Sidebar.Item /> must be a direct child of <Sidebar>; it can\'t be returned from another component')

		consoleError.mockRestore()
	})

	it('renders each item as a list item holding one control labelled by the item label', () => {
		render(<Sidebar active="overview" items={ linkItems } />)

		expect(screen.getAllByRole('listitem')).toHaveLength(2)
		expect(screen.getByRole('link', { name: 'Overview' }).closest('li')).toBeInTheDocument()
	})

	describe('link items', () => {
		it('pushes the url to history without a full navigation when shallow (the default)', async () => {
			const user = userEvent.setup()
			render(<Sidebar active="overview" items={ linkItems } />)

			await user.click(screen.getByRole('link', { name: 'Settings' }))

			expect(pushState).toHaveBeenCalledTimes(1)
			expect(pushState).toHaveBeenCalledWith(null, '', '/settings')
			// preventing the default is what stops next/link navigating as well
			expect(router.push).not.toHaveBeenCalled()
		})

		it('calls onChange with the item id after a shallow navigation', async () => {
			const user = userEvent.setup()
			const onChange = jest.fn()
			render(<Sidebar active="overview" items={ linkItems } onChange={ onChange } />)

			await user.click(screen.getByRole('link', { name: 'Settings' }))

			expect(onChange).toHaveBeenCalledTimes(1)
			expect(onChange).toHaveBeenCalledWith('settings')
		})

		it('does not throw when a shallow link is clicked without an onChange', async () => {
			const user = userEvent.setup()
			render(<Sidebar active="overview" items={ linkItems } />)

			await user.click(screen.getByRole('link', { name: 'Overview' }))

			expect(pushState).toHaveBeenCalledWith(null, '', '/profile')
		})

		it('leaves history alone when shallow is false, but still reports the change', async () => {
			const user = userEvent.setup()
			const onChange = jest.fn()
			render(<Sidebar active="overview" items={ linkItems } onChange={ onChange } shallow={ false } />)

			await user.click(screen.getByRole('link', { name: 'Settings' }))

			expect(pushState).not.toHaveBeenCalled()
			expect(onChange).toHaveBeenCalledWith('settings')
			// the real navigation is left to next/link
			expect(router.push).toHaveBeenCalledWith('/settings', expect.anything())
		})
	})

	describe('action items', () => {
		it('calls onChange with the item id and never touches history', async () => {
			const user = userEvent.setup()
			const onChange = jest.fn()
			render(<Sidebar active="save" items={ actionItems } onChange={ onChange } />)

			await user.click(screen.getByRole('button', { name: 'Discard' }))

			expect(onChange).toHaveBeenCalledTimes(1)
			expect(onChange).toHaveBeenCalledWith('discard')
			expect(pushState).not.toHaveBeenCalled()
		})

		it('only marks the active item aria-current, with an inactive control', () => {
			render(<Sidebar active="save" items={ actionItems } onChange={ jest.fn() } />)

			expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('aria-current', 'true')
			expect(screen.getByRole('button', { name: 'Discard' })).not.toHaveAttribute('aria-current')
		})
	})
})
