import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { ButtonGroup } from './ButtonGroup'
import { Button } from '../Button'

const meta: Meta<typeof ButtonGroup> = {
	component: ButtonGroup,
	title: 'Core/Button/Button.Group',
	argTypes: {
		orientation: {
			control: 'select',
			options: ['horizontal', 'vertical'],
		},
	},
	args: {
		children: (
			<>
				<Button>Save</Button>
				<Button>Edit</Button>
				<Button>Delete</Button>
			</>
		),
	},
}

export default meta
type Story = StoryObj<typeof ButtonGroup>

export const Default: Story = {}

export const Orientations: Story = {
	render: () => (
		<>
			<ButtonGroup orientation="horizontal">
				<Button>Save</Button>
				<Button>Edit</Button>
				<Button>Delete</Button>
			</ButtonGroup>
			<ButtonGroup orientation="vertical">
				<Button>Save</Button>
				<Button>Edit</Button>
				<Button>Delete</Button>
			</ButtonGroup>
		</>
	),
}

export const HasPriority: Story = {
	render: () => (
		<>
			<ButtonGroup hasPriority>
				<Button>Save</Button>
				<Button>Edit</Button>
				<Button>Delete</Button>
			</ButtonGroup>
			<ButtonGroup hasPriority={ false }>
				<Button>Save</Button>
				<Button>Edit</Button>
				<Button>Delete</Button>
			</ButtonGroup>
		</>
	),
}

export const Disabled: Story = {
	args: { disabled: true },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const buttons = canvas.getAllByRole('button')

		expect(buttons).toHaveLength(3)
		for (const button of buttons) {
			await expect(button).toHaveAttribute('data-disabled')
		}
	},
}

export const FullWidth: Story = {
	args: { fullWidth: true },
	parameters: { layout: 'padded' },
}
