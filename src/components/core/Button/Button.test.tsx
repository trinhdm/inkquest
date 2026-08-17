// import { render, screen } from '@testing-library/react'
// import { resetComponentDefaults, resetVariantStyles } from '@/lib/registries'
// import { Button } from './Button'

// describe('Button', () => {
// 	afterEach(() => {
// 		resetComponentDefaults('Button')
// 		resetVariantStyles('Button')
// 	})

// 	it('renders its children', () => {
// 		render(<Button>Save</Button>)
// 		expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
// 	})

// 	it('defaults to type="button" so it never submits a form by accident', () => {
// 		render(<Button>Save</Button>)
// 		expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
// 	})

// 	it('renders as a link when href is provided', () => {
// 		render(<Button href="/dashboard">Go to dashboard</Button>)
// 		expect(screen.getByRole('link', { name: 'Go to dashboard' })).toHaveAttribute('href', '/dashboard')
// 	})

// 	it('reflects variant and priority as data attributes for CSS targeting', () => {
// 		render(<Button variant="danger" priority="primary">Delete</Button>)
// 		const button = screen.getByRole('button', { name: 'Delete' })
// 		expect(button).toHaveAttribute('data-variant', 'danger')
// 		expect(button).toHaveAttribute('data-priority', 'primary')
// 	})

// 	it('falls back to the registered default variant when none is passed', () => {
// 		render(<Button>Default</Button>)
// 		expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'solid')
// 	})

// 	it('marks full width via data-block', () => {
// 		render(<Button fullWidth>Wide</Button>)
// 		expect(screen.getByRole('button')).toHaveAttribute('data-block', 'true')
// 	})
// })
