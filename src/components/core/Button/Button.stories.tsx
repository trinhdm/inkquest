import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
	component: Button,
	title: 'Core/Button',
	tags: ['autodocs'],
	argTypes: {
		variant: {
			control: 'select',
			options: ['solid', 'outline', 'ghost', 'light', 'dark', 'success', 'warning', 'danger'],
		},
		priority: {
			control: 'select',
			options: ['primary', 'secondary', 'tertiary'],
		},
		size: {
			control: 'select',
			options: ['sm', 'md', 'lg'],
		},
		onClick: { action: 'clicked' },
	},
	args: {
		children: 'Button',
		variant: 'solid',
		priority: 'primary',
		size: 'md',
	},
}

export default meta
type Story = StoryObj<typeof Button>

export const Solid: Story = {}

export const Outline: Story = {
	args: { variant: 'outline' },
}

export const Ghost: Story = {
	args: { variant: 'ghost' },
}

export const Danger: Story = {
	args: { variant: 'danger', priority: 'secondary' },
}

export const Sizes: Story = {
	render: ({ variant, priority }) => (
		<>
			<Button variant={ variant } priority={ priority } size="sm">Small</Button>
			<Button variant={ variant } priority={ priority } size="md">Medium</Button>
			<Button variant={ variant } priority={ priority } size="lg">Large</Button>
		</>
	),
}

export const Loading: Story = {
	args: { loading: true },
}

export const Disabled: Story = {
	args: { disabled: true },
}

export const FullWidth: Story = {
	args: { fullWidth: true },
	parameters: { layout: 'padded' },
}

export const AsLink: Story = {
	args: { href: '#', children: 'Link button' },
}
