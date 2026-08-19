import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ButtonSection } from './ButtonSection'
import { Button } from '../Button'
import { Icon } from '@/components/core/Icon'

const Row = ({ children }: { children: ReactNode }) => (
	<div style={ { display: 'flex', gap: 24, flexWrap: 'wrap' } }>{ children }</div>
)

const Group = ({ label, children }: { label: string, children: ReactNode }) => (
	<div style={ { display: 'flex', flexDirection: 'column', gap: 8 } }>
		<span style={ { fontSize: 12, fontWeight: 600, opacity: 0.6 } }>{ label }</span>
		<div style={ { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' } }>{ children }</div>
	</div>
)

// `variant`/`size`/`disabled`/`loading` aren't `ButtonSection` props —
// they're story-only controls that feed the `Button` wrapping the sections.
type ButtonSectionStoryArgs = ButtonSection.Props & {
	variant: Button.Variant
	size: Button.Size
	disabled?: boolean
	loading?: boolean
}

const meta: Meta<ButtonSectionStoryArgs> = {
	component: ButtonSection,
	title: 'Core/Button/Button.Section',
	tags: ['autodocs'],
	argTypes: {
		variant: {
			control: 'select',
			options: ['solid', 'outline', 'ghost', 'light', 'dark', 'success', 'warning', 'danger'],
		},
		size: {
			control: 'select',
			options: ['sm', 'md', 'lg'],
		},
		disabled: { control: 'boolean' },
		loading: { control: 'boolean' },
	},
	args: {
		variant: 'solid',
		size: 'md',
	},
	// `ButtonSection.Props`'s `left`/`right` discriminated union breaks
	// contextual inference on the destructured params, so annotate explicitly.
	render: ({ variant, size, disabled, loading }: ButtonSectionStoryArgs) => (
		<Button variant={ variant } size={ size } disabled={ disabled } loading={ loading }>
			<ButtonSection left><Icon type="download" /></ButtonSection>
			Download
		</Button>
	),
}

export default meta
type Story = StoryObj<ButtonSectionStoryArgs>

export const Default: Story = {}

export const Sides: Story = {
	render: ({ variant, size, disabled, loading }: ButtonSectionStoryArgs) => (
		<Row>
			<Group label="left">
				<Button variant={ variant } size={ size } disabled={ disabled } loading={ loading }>
					<ButtonSection left><Icon type="download" /></ButtonSection>
					Download
				</Button>
			</Group>
			<Group label="right">
				<Button variant={ variant } size={ size } disabled={ disabled } loading={ loading }>
					Continue
					<ButtonSection right><Icon type="right-arrow" /></ButtonSection>
				</Button>
			</Group>
			<Group label="both">
				<Button variant={ variant } size={ size } disabled={ disabled } loading={ loading }>
					<ButtonSection left><Icon type="download" /></ButtonSection>
					Download
					<ButtonSection right><Icon type="right-arrow" /></ButtonSection>
				</Button>
			</Group>
		</Row>
	),
}
