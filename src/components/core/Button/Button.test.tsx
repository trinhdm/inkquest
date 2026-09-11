import { screen } from '@testing-library/react'
import { resetVariantStyles } from '@/lib/registries'
import { resetComponentDefaults } from '@/lib/registries/componentDefaultProps'
import { renderWithTheme as render } from '@/tests/test-utils'
import { Button } from './Button'

describe('Button', () => {
	afterEach(() => {
		resetVariantStyles('Button')
	})

	// `Button.setDefaults({...})` in Button.tsx only runs once, at module import,
	// so resetting the defaults registry after every test (rather than after
	// the whole suite) would permanently wipe the "as/size/variant" defaults
	// for every test that follows — nothing re-registers them mid-file.
	afterAll(() => {
		resetComponentDefaults('Button')
	})

	it('renders its children', () => {
		render(<Button>Save</Button>)
		expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
	})

	it('defaults to type="button" so it never submits a form by accident', () => {
		render(<Button>Save</Button>)
		expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
	})

	it('respects an explicit type override instead of forcing "button"', () => {
		render(<Button type="submit">Save</Button>)
		expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
	})

	it('renders as a link when href is provided', () => {
		render(<Button href="/profile">Go to profile</Button>)
		expect(screen.getByRole('link', { name: 'Go to dashboard' })).toHaveAttribute('href', '/dashboard')
	})

	it('reflects variant and priority as data attributes for CSS targeting', () => {
		render(<Button variant="danger" priority="primary">Delete</Button>)
		const button = screen.getByRole('button', { name: 'Delete' })
		expect(button).toHaveAttribute('data-variant', 'danger')
		expect(button).toHaveAttribute('data-priority', 'primary')
	})

	it('falls back to the registered default variant when none is passed', () => {
		render(<Button>Default</Button>)
		expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'solid')
	})

	it('omits data-priority entirely when no priority is passed, rather than rendering an empty value', () => {
		render(<Button>Default</Button>)
		expect(screen.getByRole('button')).not.toHaveAttribute('data-priority')
	})

	it('marks full width via data-block', () => {
		render(<Button fullWidth>Wide</Button>)
		expect(screen.getByRole('button')).toHaveAttribute('data-block', 'true')
	})

	it('omits data-block entirely when fullWidth is falsy', () => {
		render(<Button>Narrow</Button>)
		expect(screen.getByRole('button')).not.toHaveAttribute('data-block')
	})

	it('disables the button natively and reflects it via data-disabled when disabled', () => {
		render(<Button disabled>Save</Button>)
		const button = screen.getByRole('button', { name: 'Save' })
		expect(button).toBeDisabled()
		expect(button).toHaveAttribute('data-disabled', 'true')
	})

	it('omits data-disabled entirely when not disabled', () => {
		render(<Button>Save</Button>)
		expect(screen.getByRole('button')).not.toHaveAttribute('data-disabled')
	})

	it('reflects loading state via data-loading and renders a spinner', () => {
		const { container } = render(<Button loading>Save</Button>)
		expect(screen.getByRole('button')).toHaveAttribute('data-loading', 'true')
		expect(container.querySelector('svg')).toBeInTheDocument()
	})

	it('omits data-loading entirely when not loading', () => {
		render(<Button>Save</Button>)
		expect(screen.getByRole('button')).not.toHaveAttribute('data-loading')
	})
})
