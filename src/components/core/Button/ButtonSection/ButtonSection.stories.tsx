import { SIZE_OPTIONS, VARIANT_OPTIONS } from '../options.story'
import { Button } from '../Button'
import { Icon } from '@/components/core/Icon'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

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
type ButtonSectionStoryArgs = Button.Section.Props & {
	variant: Button.Variant
	size: Button.Size
	disabled?: boolean
	loading?: boolean
}

const meta: Meta<ButtonSectionStoryArgs> = {
	component: Button.Section,
	title: 'Core/Button/Button.Section',
	tags: ['autodocs'],
	argTypes: {
		variant: {
			control: 'select',
			options: VARIANT_OPTIONS,
		},
		size: {
			control: 'select',
			options: SIZE_OPTIONS,
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
	render: ({ variant, size, disabled, loading }: ButtonSectionStoryArgs) => {
		const buttonProps = { variant, size, disabled, loading }

		return (
			<Button { ...buttonProps }>
				<Button.Section left><Icon type="download" /></Button.Section>
				Download
			</Button>
		)
	},
}

export default meta
type Story = StoryObj<ButtonSectionStoryArgs>

export const Default: Story = {}

export const Sides: Story = {
	render: ({ variant, size, disabled, loading }: ButtonSectionStoryArgs) => {
		const buttonProps = { variant, size, disabled, loading }

		return (
			<Row>
				<Group label="left">
					<Button { ...buttonProps }>
						<Button.Section left>
							<Icon type="download" />
						</Button.Section>
						Download
					</Button>
				</Group>
				<Group label="right">
					<Button { ...buttonProps }>
						Continue
						<Button.Section right>
							<Icon type="right-arrow" />
						</Button.Section>
					</Button>
				</Group>
				<Group label="both">
					<Button { ...buttonProps }>
						<Button.Section left>
							<Icon type="download" />
						</Button.Section>
						Download
						<Button.Section right>
							<Icon type="right-arrow" />
						</Button.Section>
					</Button>
				</Group>
			</Row>
		)
	},
}
