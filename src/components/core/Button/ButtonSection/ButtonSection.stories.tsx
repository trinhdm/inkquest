import { BOOLEAN_OPTIONS, SIZE_OPTIONS, VARIANT_OPTIONS } from '../options.story'
import { Button } from '../Button'
import { Component } from 'react'
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
		<span style={ { font: 'var(--inkq-text-control)', letterSpacing: '.15em', textTransform: 'uppercase', opacity: 0.6 } }>
			{ label }
		</span>
		<div style={ { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' } }>
			{ children }
		</div>
	</div>
)

// Local-only class error boundary (not a source-file change — this never
// leaves the stories file) used purely to demonstrate `ButtonSection`'s
// required-context guard without crashing the whole story canvas: a raw,
// uncaught render throw would take down every other group rendered in the
// same story, not just the misuse case.
interface ErrorBoundaryState {
	message?: string
}

class RenderErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
	state: ErrorBoundaryState = {}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { message: error.message }
	}

	render() {
		if (this.state.message)
			return <span data-testid="button-section-error">{ this.state.message }</span>
		return this.props.children
	}
}

// `Button.Section.Props` (the `declare namespace` export) is just the raw
// `ButtonSectionProps` interface — it doesn't include `unstyled`/
// `attributes`/etc., which only exist on the actual accepted prop type,
// `PolymorphicProps<ButtonSectionProps, C>`. `Parameters<typeof
// Button.Section>[0]` reads that real, wrapped type straight off the
// component itself — `ButtonSectionSpecs`'s `isCompound: true`
// makes `as` resolve to `never` (compound components don't take a tag
// override), so this also correctly excludes `as` from the story's own
// controls.
//
// `variant`/`size`/`disabled`/`loading` aren't `ButtonSection` props —
// they're story-only controls that feed the `Button` wrapping the sections.
type ButtonSectionStoryArgs = Parameters<typeof Button.Section>[0] & {
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
			description: 'Part of `PolymorphicProps` (via the shared `SpecsContract`), not `ButtonSection`\'s own `ButtonSectionProps`. The semantic base class (`inkq-button__section`) on this section\'s `<span data-side="...">` wrapper is ALWAYS emitted regardless of this prop — `unstyled` only suppresses the CSS-module-hashed class normally appended alongside it, via the `styles(\'section\')` call `ButtonSection` makes, styled under `rootName` read from the REQUIRED `Button.context` (`useButtonCxt` = `useRootCxt`, fixed to `\'Button\'` — `ButtonSection` now throws entirely when rendered outside a `Button`, see the `RequiresButtonParent` story). Set directly on `Button.Section` itself here, independent of the wrapping `Button`\'s own `unstyled` state — see the `Unstyled` story.',
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
							<Icon type="arrow-right" />
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
							<Icon type="arrow-right" />
						</Button.Section>
					</Button>
				</Group>
			</Row>
		)
	},
}

// `buildSections` (`Button.tsx`) only ever assigns the FIRST
// `Button.Section[left]` (or `[right]`) it encounters to `left`/`right` —
// every subsequent same-side section is dropped (and dev-warns) rather than
// rendered.
export const MultipleSections: Story = {
	render: ({ variant, size, disabled, loading }: ButtonSectionStoryArgs) => {
		const buttonProps = { variant, size, disabled, loading }

		return (
			<Button { ...buttonProps }>
				<Button.Section left><Icon type="download" /></Button.Section>
				<Button.Section left><Icon type="attach" /></Button.Section>
				Save
			</Button>
		)
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			button = canvas.getByRole('button'),
			leftSections = button.querySelectorAll('[data-side="left"]')

		await expect(leftSections).toHaveLength(1)
	},
}

// `unstyled` does NOT remove the base `inkq-button__section` class
// `useStyles`/`getClassName.tsx` applies to this section's
// `<span data-side="...">` wrapper — per `getClassName.tsx`, the base class
// is now ALWAYS emitted (`classList = [baseClass]` unconditionally). It only
// suppresses the CSS-module-hashed class normally appended alongside it, via
// the `styles('section')` call `ButtonSection` makes. Set only on the
// `Button.Section` here (not on the wrapping `Button`), to isolate its own,
// independent effect — `ButtonSection.tsx` reads `unstyled` off its OWN props
// (via `useProps(NAME, _props)`/`useStyles`), not off the `Button.context`
// value the wrapping `Button` publishes through `ButtonProvider` (that value
// only carries `unstyled` — and `ButtonSection.tsx` only ever destructures
// `rootName` off the required context, via `useButtonCxt`, never `unstyled` —
// see the `RequiresButtonParent` story for that required-context contract).
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

		// Anchor on the base `.inkq-button__section` class, not `[data-side]` —
		// `ButtonSection.tsx` sets `side` via `attributes.data.side`, and
		// `get-attributes.ts`'s `filterDecorative` strips non-state `data-*`
		// keys (like `side`) exactly when `unstyled` is set, so `data-side` is
		// present on the styled section but absent on the unstyled one. The
		// base class, by contrast, is always emitted regardless of `unstyled`
		// (see the file-level comment above), so it's a safe anchor here.
		const [unstyledButton, styledButton] = buttons,
			unstyledSection = unstyledButton.querySelector('.inkq-button__section') as HTMLElement,
			styledSection = styledButton.querySelector('.inkq-button__section') as HTMLElement

		// The hashed CSS-module class is build-generated, so assert on its
		// presence/shape rather than a literal hash: any class beyond the
		// semantic base class means the module class survived.
		const hasModuleClass = (el: Element, base: string) =>
			Array.from(el.classList).some(c => c !== base)

		await expect(styledSection).toHaveClass('inkq-button__section')
		await expect(unstyledSection).toHaveClass('inkq-button__section')
		expect(hasModuleClass(styledSection, 'inkq-button__section')).toBe(true)
		expect(hasModuleClass(unstyledSection, 'inkq-button__section')).toBe(false)
	},
}

// `ButtonSection` now reads `Button.context` via the REQUIRED reader
// (`useButtonCxt` = `useRootCxt`, not the optional `useSafeRootCxt`) —
// `const { rootName } = useButtonCxt(NAME)` in `ButtonSection.tsx` throws
// (`createRootCxt.tsx`'s `useRootCxt`: `<ButtonSection /> must be rendered
// inside <Button>`) the instant it's rendered with no wrapping `Button` at
// all, rather than silently falling back to styling under its own name.
// There's also no more dynamic per-parent naming to demonstrate even if it
// didn't throw: `Button.tsx`'s `ButtonProvider` never passes an explicit
// `rootName`, so `createRootCxt`'s own default (`rootName ?? name`, `name`
// being the fixed `'Button'` passed to `createRootCxt<ButtonContext>('Button')`)
// always resolves to `'Button'` — `rootName` is no longer derived from a
// `ctx.displayName` that could vary.
//
// A raw, uncaught render throw would crash every other group in this story,
// so the misuse case is wrapped in a local (stories-file-only, not a source
// change) `RenderErrorBoundary` purely to demonstrate/assert the guard's
// error message without taking down the whole canvas.
export const RequiresButtonParent: Story = {
	parameters: { layout: 'padded' },
	render: () => (
		<Row>
			<Group label="inside a Button (valid)">
				<Button>
					<Button.Section left><Icon type="download" /></Button.Section>
					Download
				</Button>
			</Group>
			<Group label="standalone — throws (guarded by useButtonCxt)">
				<RenderErrorBoundary>
					<Button.Section left><Icon type="download" /></Button.Section>
				</RenderErrorBoundary>
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		const validSection = canvasElement.querySelector('[data-side="left"]')
		await expect(validSection).toBeInTheDocument()
		await expect(validSection).toHaveClass('inkq-button__section')

		const errorFallback = await canvas.findByTestId('button-section-error')
		await expect(errorFallback).toHaveTextContent('<ButtonSection /> must be rendered inside <Button>')
	},
}

// `enforceIconSize` (the old `cloneElement` that forced icon children to
// `size={18}`) is gone — an `Icon` child now renders verbatim, keeping
// whichever `size` it resolves on its own: its registered default (`16`,
// per `Icon.setDefaults`) when unset, or its own explicit `size` prop when
// set. Lucide's underlying `Icon` component (`lucide-react`) renders `size`
// straight onto the `<svg>`'s `width`/`height` attributes.
export const IconChildren: Story = {
	render: ({ variant, size, disabled, loading }: ButtonSectionStoryArgs) => {
		const buttonProps = { variant, size, disabled, loading }

		return (
			<Row>
				<Group label="default icon size (registered default: 16)">
					<Button { ...buttonProps }>
						<Button.Section left><Icon type="download" /></Button.Section>
						Download
					</Button>
				</Group>
				<Group label="explicit icon size (own prop, not cloned/forced)">
					<Button { ...buttonProps }>
						<Button.Section left><Icon type="download" size={ 32 } /></Button.Section>
						Download
					</Button>
				</Group>
			</Row>
		)
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			buttons = canvas.getAllByRole('button')

		expect(buttons).toHaveLength(2)

		const [defaultSizeButton, explicitSizeButton] = buttons,
			defaultIcon = defaultSizeButton.querySelector('svg') as SVGElement,
			explicitIcon = explicitSizeButton.querySelector('svg') as SVGElement

		await expect(defaultIcon).toHaveAttribute('width', '16')
		await expect(defaultIcon).toHaveAttribute('height', '16')

		await expect(explicitIcon).toHaveAttribute('width', '32')
		await expect(explicitIcon).toHaveAttribute('height', '32')
	},
}
