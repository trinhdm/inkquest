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

// `Button.Section.Props` (the `declare namespace` export) is just the raw
// `ButtonSectionProps` interface — it doesn't include `unstyled`/
// `attributes`/etc., which only exist on the actual accepted prop type,
// `PolymorphicProps<ButtonSectionProps, C>`. `Parameters<typeof
// Button.Section>[0]` reads that real, wrapped type straight off the
// component itself — `ButtonSectionSpecs`'s `specIs: { compound: true }`
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
			description: 'Part of `PolymorphicProps` (via the shared `SpecsContract`), not `ButtonSection`\'s own `ButtonSectionProps`. The semantic base class (`inkq-button__section`) on this section\'s `<span data-side="...">` wrapper is ALWAYS emitted regardless of this prop — `unstyled` only suppresses the CSS-module-hashed class normally appended alongside it, via the `styles(\'section\')` call `ButtonSection` makes (styled under whatever name the wrapping `Button` provides through `Button.context`\'s `displayName`, or `"ButtonSection"` when rendered outside a `Button`). Set directly on `Button.Section` itself here, independent of the wrapping `Button`\'s own `unstyled` state — see the `Unstyled` story.',
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
// only carries `displayName`/`unstyled` — there's no `iconProps` — and while
// `ButtonSection.tsx` DOES read `ctx.displayName`, to decide which name it
// styles under (`ctx?.displayName ?? NAME` — see the `Standalone` story), it
// never reads `ctx.unstyled`).
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

// `ButtonSection` reads `Button.context` via the SAFE reader (`useButtonCxt`
// = `useSafeRootCxt`), so rendering it with no wrapping `Button` doesn't
// throw — it silently changes which name it styles under
// (`ctx?.displayName ?? NAME`, `NAME` being `'ButtonSection'` here).
// `getBaseClass` (`getClassName.tsx`) then derives a DIFFERENT base class:
// `toKebabCase('Button')` + `'__section'` => `inkq-button__section` when
// wrapped (matches `Button.module.scss`'s `.inkq-button { &__section {...} }`
// nesting, so a hashed module class is appended), vs.
// `toKebabCase('ButtonSection')` + `'__section'` => `inkq-button-section__section`
// when standalone — a selector `Button.module.scss` has no rule for at all,
// so `classes['inkq-button-section__section']` is `undefined` and NO hashed
// module class is appended alongside it.
export const Standalone: Story = {
	parameters: { layout: 'padded' },
	render: () => (
		<Row>
			<Group label="inside a Button">
				<Button>
					<Button.Section left><Icon type="download" /></Button.Section>
					Download
				</Button>
			</Group>
			<Group label="standalone (no wrapping Button)">
				<Button.Section left><Icon type="download" /></Button.Section>
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const sections = canvasElement.querySelectorAll('[data-side="left"]')

		expect(sections).toHaveLength(2)

		const [insideButton, standalone] = Array.from(sections)

		const hasModuleClass = (el: Element, base: string) =>
			Array.from(el.classList).some(c => c !== base)

		await expect(insideButton).toHaveClass('inkq-button__section')
		expect(hasModuleClass(insideButton, 'inkq-button__section')).toBe(true)

		await expect(standalone).toHaveClass('inkq-button-section__section')
		expect(hasModuleClass(standalone, 'inkq-button-section__section')).toBe(false)
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
