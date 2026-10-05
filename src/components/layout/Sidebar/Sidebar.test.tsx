import { getDefaultProps } from '@/hooks/useProps'
import { render, reset, screen, within } from '@/tests/test-utils'
import userEvent from '@testing-library/user-event'
import { Sidebar } from './Sidebar'

describe('Sidebar', () => {
	reset('Sidebar', 'Button')

	const linkItems: Sidebar.LinkItem[] = [
		{ id: 'overview', label: 'Overview', url: '/profile' },
		{ id: 'settings', label: 'Settings', url: '/settings' },
	]

	const actionItems: Sidebar.ActionItem[] = [
		{ id: 'save', label: 'Save' },
		{ id: 'discard', label: 'Discard' },
	]

	it('defaults `as` to "aside", `scroll` to false, and `shallow` to true', () => {
		const defaults = getDefaultProps<Sidebar.Props & { as: 'aside' }>('Sidebar')
		expect(defaults.as).toBe('aside')
		expect(defaults.scroll).toBe(false)
		expect(defaults.shallow).toBe(true)
	})

	it('renders a navigation menu listing every item', () => {
		render(<Sidebar active="overview" items={ linkItems } />)
		const menu = screen.getByRole('menu')
		expect(within(menu).getByRole('link', { name: 'Overview' })).toBeInTheDocument()
		expect(within(menu).getByRole('link', { name: 'Settings' })).toBeInTheDocument()
	})

	it('renders items with a `url` as links pointing to that url', () => {
		render(<Sidebar active="overview" items={ linkItems } />)
		expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute('href', '/settings')
	})

	it('marks the active link item with aria-current="page"', () => {
		render(<Sidebar active="settings" items={ linkItems } />)
		expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute('aria-current', 'page')
	})

	it('does not mark inactive link items with aria-current', () => {
		render(<Sidebar active="settings" items={ linkItems } />)
		expect(screen.getByRole('link', { name: 'Overview' })).not.toHaveAttribute('aria-current')
	})

	it('renders items without a `url` as buttons instead of links', () => {
		render(
			<Sidebar
				active="save"
				items={ actionItems }
				onItemChange={ jest.fn() }
			/>
		)
		expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
		expect(screen.queryByRole('link')).not.toBeInTheDocument()
	})

	it('marks the active action item with aria-current="true"', () => {
		render(
			<Sidebar
				active="save"
				items={ actionItems }
				onItemChange={ jest.fn() }
			/>
		)
		expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('aria-current', 'true')
	})

	it('calls onItemChange with the clicked action item id', async () => {
		const user = userEvent.setup()
		const onItemChange = jest.fn()

		render(
			<Sidebar
				active="save"
				items={ actionItems }
				onItemChange={ onItemChange }
			/>
		)

		await user.click(screen.getByRole('button', { name: 'Discard' }))
		expect(onItemChange).toHaveBeenCalledWith('discard')
	})

	it('renders passed children alongside the nav', () => {
		render(
			<Sidebar active="overview" items={ linkItems }>
				<span>Footer content</span>
			</Sidebar>
		)
		expect(screen.getByText('Footer content')).toBeInTheDocument()
	})
})
