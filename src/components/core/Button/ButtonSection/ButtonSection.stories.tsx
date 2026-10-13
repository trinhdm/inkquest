import { Component } from 'react'
import { expect, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { Button } from '../Button'
import { Icon } from '@/components/core/Icon'
import { BOOLEAN_OPTIONS, SIZE_OPTIONS, VARIANT_OPTIONS } from '../options.story'
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
			description: 'Part of the shared `FactoryContract` (`unstyled` on `_PolymorphicContract`), not `ButtonSection`\'s own `ButtonSectionProps`. The semantic base class (`inkq-button__section`) on this section\'s `<span data-side="...">` wrapper is emitted regardless of this prop (an inherited semantic `className` could replace it). `unstyled` drops the CSS-module-hashed class from `ButtonSection`\'s `styles(baseName)` call (it uses no config classes or tokens), and because `unstyled` reaches the section\'s `Box` through `others`, `Box` also strips the non-state `data-side` attribute. `ButtonSection` reads `Button.context` through the REQUIRED reader `useButtonCtx(NAME)` (`= useRootCtx`, so it throws when rendered outside a `Button`, see the `RequiresButtonParent` story). That context supplies `baseName` — `NAME` (`\'Button.Section\'`) with the `\'Button\'` prefix stripped and lowercased, i.e. `\'section\'` — which is the selector passed to `styles(...)`. The style root name comes from the context too: `ButtonSection` calls `useStyles({ context, props, withRootName: true })`, which takes the root name from the context\'s `rootName`, and the compound provider (`createCompoundCtx`) always sets `rootName` to the name it was created with, `\'Button\'`. `unstyled` is also inherited: `ButtonSection` runs its props through `useButtonProps`, so a section fills `unstyled` from the enclosing `Button`\'s context ONLY when the key is absent from its own props — an own prop, including an explicit `unstyled={false}`, always wins. See the `Unstyled` story (set on the section itself) and the `UnstyledInheritance` story (inherited from the `Button`).',
		},
	},
	args: {
		variant: buttonDefaults.variant,
		size: buttonDefaults.size,
	},
	// `ButtonSection.Props`'s `left`/`right` discriminated union breaks
	// contextual inference on the destructured params, so annotate explicitly.
	render: ({ variant, size, disabled, loading, unstyled }: ButtonSectionStoryArgs) => {
		const buttonProps = { variant, size, disabled, loading }

		return (
			<Button { ...buttonProps }>
				<Button.Section left unstyled={ unstyled }><Icon type="download" /></Button.Section>
				Download
			</Button>
		)
	},
}

export default meta
type Story = StoryObj<ButtonSectionStoryArgs>

export const Default: Story = {}

export const Sides: Story = {
	render: ({ variant, size, disabled, loading, unstyled }: ButtonSectionStoryArgs) => {
		const buttonProps = { variant, size, disabled, loading }

		return (
			<Row>
				<Group label="left">
					<Button { ...buttonProps }>
						<Button.Section left unstyled={ unstyled }>
							<Icon type="download" />
						</Button.Section>
						Download
					</Button>
				</Group>
				<Group label="right">
					<Button { ...buttonProps }>
						Continue
						<Button.Section right unstyled={ unstyled }>
							<Icon type="arrow-right" />
						</Button.Section>
					</Button>
				</Group>
				<Group label="both">
					<Button { ...buttonProps }>
						<Button.Section left unstyled={ unstyled }>
							<Icon type="download" />
						</Button.Section>
						Download
						<Button.Section right unstyled={ unstyled }>
							<Icon type="arrow-right" />
						</Button.Section>
					</Button>
				</Group>
			</Row>
		)
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			buttons = canvas.getAllByRole('button')

		await expect(buttons).toHaveLength(3)

		// `buildSections` (`Button.tsx`) lays the inner element out as
		// `[left section][label span][right section]`, whichever of the two
		// sections exist. Read each button's inner children in DOM order,
		// ignoring the loader (only present while `loading`).
		const layoutOf = (button: HTMLElement) =>
			Array.from(button.querySelector('.inkq-button__inner')!.children)
				.filter(el => !el.matches('.inkq-button__loader'))
				.map(el => el.matches('.inkq-button__label')
					? 'label'
					: el.getAttribute('data-side'))

		const [left, right, both] = buttons

		await expect(layoutOf(left)).toEqual(['left', 'label'])
		await expect(layoutOf(right)).toEqual(['label', 'right'])
		await expect(layoutOf(both)).toEqual(['left', 'label', 'right'])

		// Each side is reflected on its own `data-side`, and the sibling side
		// is absent from buttons that don't declare it.
		await expect(left.querySelectorAll('[data-side="left"]')).toHaveLength(1)
		await expect(left.querySelectorAll('[data-side="right"]')).toHaveLength(0)
		await expect(right.querySelectorAll('[data-side="right"]')).toHaveLength(1)
		await expect(right.querySelectorAll('[data-side="left"]')).toHaveLength(0)
		await expect(both.querySelectorAll('[data-side="left"]')).toHaveLength(1)
		await expect(both.querySelectorAll('[data-side="right"]')).toHaveLength(1)
	},
}

// `buildSections` (`Button.tsx`) only ever assigns the FIRST
// `Button.Section[left]` (or `[right]`) it encounters to `left`/`right` —
// every subsequent same-side section is dropped (and dev-warns) rather than
// rendered.
export const MultipleSections: Story = {
	render: ({ variant, size, disabled, loading, unstyled }: ButtonSectionStoryArgs) => {
		const buttonProps = { variant, size, disabled, loading }

		return (
			<Button { ...buttonProps }>
				<Button.Section left unstyled={ unstyled }><Icon type="download" /></Button.Section>
				<Button.Section left unstyled={ unstyled }><Icon type="attach" /></Button.Section>
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
// is not gated on `check.isUnstyled`: the first `classList` entry is
// `namespace ?? baseName` (an inherited semantic `className` could replace it;
// none is passed here). `unstyled` suppresses the CSS-module-hashed class
// (`styleName`) normally appended alongside it, via
// the `styles(context.baseName)` call `ButtonSection` makes (`baseName` is
// `'section'`), and makes `Box` strip the non-state `data-side` attribute
// (both asserted below). `ButtonSection` has no config classes or tokens. Set only on the `Button.Section` here (not on the wrapping
// `Button`), to isolate its own prop's effect. `ButtonSection.tsx` also
// inherits `unstyled` from the enclosing `Button`'s context when it has none
// of its own (own prop wins) — see `UnstyledInheritance` below — and uses
// that context for `baseName`/`rootName`. See the `RequiresButtonParent`
// story for the required-context contract.
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
		// `Box/utils/buildAttributes.ts`'s `keepStateAttrs` strips non-state `data-*`
		// keys (like `side`) exactly when `unstyled` is set, so `data-side` is
		// present on the styled section but absent on the unstyled one. The
		// base class, by contrast, is emitted regardless of `unstyled`
		// (see the comment above this story), so it's a safe anchor here.
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

// A section with no `unstyled` of its own fills it from the enclosing
// `Button`'s context (`useButtonProps`); an own `unstyled` — including an
// explicit `false` — always wins. Each group is told apart by the same two
// signals as `Unstyled`: the CSS-module hash on the section's class, and
// `data-side`, which `buildAttributes` strips from an unstyled element.
export const UnstyledInheritance: Story = {
	parameters: { layout: 'padded' },
	render: ({ variant, size, disabled, loading }: ButtonSectionStoryArgs) => {
		const buttonProps = { variant, size, disabled, loading }

		return (
			<Row>
				<Group label="Button unstyled, section sets nothing (inherits)">
					<Button { ...buttonProps } unstyled>
						<Button.Section left><Icon type="download" /></Button.Section>
						Download
					</Button>
				</Group>
				<Group label="Button unstyled, section unstyled={false} (own prop wins)">
					<Button { ...buttonProps } unstyled>
						<Button.Section left unstyled={ false }><Icon type="download" /></Button.Section>
						Download
					</Button>
				</Group>
				<Group label="Button styled, section unstyled (contrast)">
					<Button { ...buttonProps }>
						<Button.Section left unstyled><Icon type="download" /></Button.Section>
						Download
					</Button>
				</Group>
			</Row>
		)
	},
	play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
		const canvas = within(canvasElement),
			buttons = canvas.getAllByRole('button')

		expect(buttons).toHaveLength(3)

		const [inherits, ownFalse, styledButton] = buttons.map(
			button => button.querySelector('.inkq-button__section') as HTMLElement
		)

		const hasModuleClass = (el: Element, base: string) =>
			Array.from(el.classList).some(c => c !== base)

		for (const section of [inherits, ownFalse, styledButton])
			await expect(section).toHaveClass('inkq-button__section')

		// (1) inherited from the unstyled Button
		expect(hasModuleClass(inherits, 'inkq-button__section')).toBe(false)
		await expect(inherits).not.toHaveAttribute('data-side')

		// (2) own `unstyled={ false }` beats the Button's `unstyled`
		expect(hasModuleClass(ownFalse, 'inkq-button__section')).toBe(true)
		await expect(ownFalse).toHaveAttribute('data-side', 'left')

		// (3) own `unstyled` on a styled Button
		expect(hasModuleClass(styledButton, 'inkq-button__section')).toBe(false)
		await expect(styledButton).not.toHaveAttribute('data-side')
	},
}

// `ButtonSection` reads `Button.context` via the REQUIRED reader
// (`useButtonCtx` = `useRootCtx`, not the optional `useSafeRootCtx`) —
// `const context = useButtonCtx(NAME)` in `ButtonSection.tsx` throws
// (`createCompoundCtx.tsx`'s `useRootCtx`: `Button: <Button.Section /> must be
// a direct child of <Button>; it can't be returned from another component`) the instant it's rendered with no wrapping `Button` at
// all, rather than silently falling back to styling under its own name.
// There's also no per-parent naming to demonstrate: `createCompoundCtx`'s
// `RootProvider` always sets `rootName` to the fixed name it was created with
// (`'Button'`), and `useStyles({ ..., withRootName: true })` takes the style
// root name from that context value.
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
			<Group label="standalone — throws (guarded by useButtonCtx)">
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
		await expect(errorFallback).toHaveTextContent('<Button.Section /> must be a direct child of <Button>')
	},
}

// `enforceIconSize` (the old `cloneElement` that forced icon children to
// `size={18}`) is gone — an `Icon` child now renders verbatim, keeping
// whichever `size` it resolves on its own: its registered default (`16`,
// per `Icon.set({ defaultProps: DEFAULT_PROPS, displayName: NAME })`) when unset, or its own explicit `size` prop when
// set. Lucide's underlying `Icon` component (`lucide-react`) renders `size`
// straight onto the `<svg>`'s `width`/`height` attributes.
//
// Those are ATTRIBUTES only. While styled, `Icon.module.scss` sets `width`/
// `height` to `1em` with `font-size: var(--icon-size)`, and `Button.module.scss`
// sets `--icon-size` on the inner element from `--button-icon-size`, so both
// groups LOOK the same size — it follows the Button's `size`, not the Icon's.
export const IconChildren: Story = {
	render: ({ variant, size, disabled, loading, unstyled }: ButtonSectionStoryArgs) => {
		const buttonProps = { variant, size, disabled, loading }

		return (
			<Row>
				<Group label="no size prop (registered default attribute: 16)">
					<Button { ...buttonProps }>
						<Button.Section left unstyled={ unstyled }><Icon type="download" /></Button.Section>
						Download
					</Button>
				</Group>
				<Group label="size={ 32 } (own prop kept as attribute; not cloned/forced)">
					<Button { ...buttonProps }>
						<Button.Section left unstyled={ unstyled }><Icon type="download" size={ 32 } /></Button.Section>
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
