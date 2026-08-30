import { BOOLEAN_OPTIONS, SIZE_OPTIONS, VARIANT_OPTIONS } from '../options.story'
import { Button } from '../Button'
import { expect, within } from 'storybook/test'
import { Icon } from '@/components/core/Icon'
import { getDefaultProps } from '@/lib/registries'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const Row = ({ children }: { children: ReactNode }) => (
	<div style={ { display: 'flex', gap: 24, flexWrap: 'wrap' } }>{ children }</div>
)

const Group = ({ label, children }: { label: string, children: ReactNode }) => (
	<div style={ { display: 'flex', flexDirection: 'column', gap: 8 } }>
		<span style={ { font: 'var(--inkq-font-control)', letterSpacing: '.15em', textTransform: 'uppercase', opacity: 0.6 } }>
			{ label }
		</span>
		<div style={ { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' } }>
			{ children }
		</div>
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

// `variant`/`size` here only ever feed the `Button` wrapper, so they come
// from Button's own registered defaults rather than a hand-typed guess.
const buttonDefaults = getDefaultProps<Button.Props>('Button')

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
		unstyled: {
			control: 'boolean',
			description: 'Inherited from `BoxProps`. When true, the `styles(\'section\')` call `ButtonSection` makes returns an empty class name instead of its `inkq-button__section` base class (nested inside `Button`, which clones sections with `parentName="Button"`) — see the `Unstyled` story. Set directly on `Button.Section` itself, independent of the wrapping `Button`\'s own `unstyled` state.',
		},
	},
	args: {
		variant: buttonDefaults.variant,
		size: buttonDefaults.size,
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

// `unstyled` strips the base `inkq-button__section` class `useStyles`/
// `getClassName.tsx` applies to this section's `<span data-side="...">`
// wrapper — verified against `ButtonSection.tsx`'s own render, which only
// ever calls `styles('section')`. Set only on the `Button.Section` here (not
// on the wrapping `Button`), to isolate its own, independent effect.
export const Unstyled: Story = {
	parameters: { controls: { exclude: ['unstyled'] } },
	render: ({ variant, size, disabled, loading }: ButtonSectionStoryArgs) => {
		const buttonProps = { variant, size, disabled, loading }

		return (
			<Row>
				{ BOOLEAN_OPTIONS.map(unstyled => (
					<Group key={ String(unstyled) } label={ String(unstyled) }>
						<Button { ...buttonProps }>
							<Button.Section left unstyled={ unstyled }>
								<Icon type="download" />
							</Button.Section>
							Download
						</Button>
					</Group>
				)) }
			</Row>
		)
	},
	play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
		const canvas = within(canvasElement),
			buttons = canvas.getAllByRole('button')

		expect(buttons).toHaveLength(2)

		const [unstyledButton, styledButton] = buttons,
			unstyledSection = unstyledButton.querySelector('[data-side="left"]'),
			styledSection = styledButton.querySelector('[data-side="left"]')

		await expect(styledSection).toHaveClass('inkq-button__section')
		await expect(unstyledSection).not.toHaveClass('inkq-button__section')
	},
}
