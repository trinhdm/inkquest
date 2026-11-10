import { Component } from 'react'
import { expect, fn, userEvent, within } from 'storybook/test'
import { Section } from '../Section'
import { Button } from '@/components/core/Button'
import { BOOLEAN_OPTIONS, GROUP_GAP_BY_SIZE, SIZE_OPTIONS } from '@/components/core/Button/options.story'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import moduleClasses from '../Section.module.scss'

// `Section.Footer` is attached in `Section.tsx` (`Footer: SectionFooter`), so this
// file only imports `Section`. It has no registered defaults (`.set({ displayName })`
// only), so `meta.args` has nothing to read back with `getDefaultProps`.
//
// `size` is a `Button.Size`, so its option list comes from the Button family's shared
// `options.story.ts`. `Section.Footer` has no other enum prop.

type FooterLayout = Exclude<Section.Layout, 'content-blocks'>

// `buildContent` (`buildSection.tsx`) puts `{ as: Grid.Item, span: 1 }` in the footer's
// context for these two layouts only.
const HERO_GRID_LAYOUTS = ['hero-split', 'hero-tight'] as const satisfies readonly FooterLayout[]

// Every other layout that renders a footer: a plain `div`, no grid placement of its own.
const PLAIN_LAYOUTS = [
	'default', 'banner', 'banner-note', 'hero',
	'content', 'content-form', 'content-split',
] as const satisfies readonly FooterLayout[]

const BUTTON_COUNTS = [0, 1, 2, 3] as const

// `Section`'s semantic root class, used to scope a query to one Section.
const ROOT_SELECTOR = '.inkq-section'

const Row = ({ children }: { children: ReactNode }) => (
	<div style={ { display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' } }>
		{ children }
	</div>
)

const Group = ({ label, children }: { label: string, children: ReactNode }) => (
	<div style={ { display: 'flex', flexDirection: 'column', gap: 8, minWidth: 360 } }>
		<span style={ { font: 'var(--inkq-text-control)', letterSpacing: '.15em', textTransform: 'uppercase', opacity: 0.6 } }>
			{ label }
		</span>
		{ children }
	</div>
)

// Catches the "outside a Section" error so the story can show and assert it.
class ErrorBoundary extends Component<{ children: ReactNode }, { message: string | null }> {
	state = { message: null as string | null }

	static getDerivedStateFromError(error: Error) {
		return { message: error.message }
	}

	render() {
		return this.state.message === null
			? this.props.children
			: <p role="alert">{ this.state.message }</p>
	}
}

// Module-level spies for the interaction stories (Storybook resets them between
// stories; each play also clears them first).
const onFirst = fn(),
	onSecond = fn()

const buttons = (...labels: string[]) =>
	labels.map(label => <Button key={ label }>{ label }</Button>)

// `Parameters<typeof Section.Footer>[0]` reads the real, wrapped prop type off the
// component itself (it includes `unstyled`, from the factory contract). The
// footer is a compound part, so there is no `as`.
type FooterStoryProps = Parameters<typeof Section.Footer>[0]
type Story = StoryObj<FooterStoryProps>

interface SectionOptions {
	/** `false` turns the reveal animation off; unset keeps the registered default (on) */
	animated?: false
	layout?: FooterLayout
	title: string
}

// The one template every story shares. `Section.Footer` is a DIRECT child of
// `Section` here, never inside a Fragment or a component of its own: `Section` only
// recognizes it that way and only then provides the context it reads.
const footerSection = (
	args: FooterStoryProps,
	{ animated, layout = 'default', title }: SectionOptions
) => (
	<Section layout={ layout } title={ title } { ...(animated === false && { animated }) }>
		<Section.Footer { ...args } />
	</Section>
)

// A footer's root element: the parent of its `Button.Group`.
const footerOf = (canvasElement: HTMLElement, title: string) => {
	const root = within(canvasElement).getByRole('heading', { name: title }).closest(ROOT_SELECTOR) as HTMLElement
	return within(root).getByRole('group').parentElement as HTMLElement
}

const gapOf = (footer: HTMLElement) =>
	within(footer).getByRole('group').style.getPropertyValue('--button-group-gap')

const meta: Meta<FooterStoryProps> = {
	component: Section.Footer,
	title: 'Layout/Section/Section.Footer',
	argTypes: {
		as: {
			control: false,
			description: 'Not an accepted prop: `Section.Footer` is a compound part (`isCompound: true`), so the type forces `as?: never`. What it renders is decided by `Section`\'s context: a plain `div`, or a `Grid.Item` in the `hero-split` and `hero-tight` layouts. See the `HeroGridItem` story.',
		},
		children: {
			control: false,
			description: 'Required. `partitionFooter` splits it: the first two `Button`s go into a `Button.Group` (`hasPriority` only when there are two); every other non-`Button` child goes into an actions `div` ahead of the group. A third and later `Button` is dropped. See the `ButtonCount` and `ContentAndButtons` stories.',
		},
		revealFrom: {
			control: 'number',
			description: 'First reveal slot. Normally inherited from `Section`\'s context (reserved while it builds, `undefined` when not animated); a prop wins over the context. The actions `div` takes `revealFrom`, the buttons take the slots after it (or start at `revealFrom` when there is no other content). See the `RevealFrom` story.',
		},
		size: {
			control: 'select',
			options: SIZE_OPTIONS,
			description: 'A `Button.Size` for the footer\'s `Button.Group`. Normally inherited from `Section`\'s context (`lg` for the `hero` layout, `md` otherwise); a prop wins over the context. See the `Size` and `SizeFromContext` stories.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Part of the factory\'s `FactoryContract`. Drops the CSS-module hash from the footer root; the semantic base class (`inkq-section__footer`) stays. See the `Unstyled` story.',
		},
	},
	args: {
		children: buttons('Learn more', 'View more'),
	},
	parameters: { layout: 'padded' },
	render: (args) => footerSection(args, { title: 'Section footer' }),
}

export default meta

/**
 * Two `Button`s become a `Button.Group` with `hasPriority`: the first is
 * `primary`, the second `secondary`. With no other content there is no actions
 * `div`; the group is the footer's only child.
 */
export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			group = canvas.getByRole('group'),
			[first, second] = within(group).getAllByRole('button')

		await expect(first).toHaveTextContent('Learn more')
		await expect(second).toHaveTextContent('View more')
		await expect(first).toHaveAttribute('data-priority', 'primary')
		await expect(second).toHaveAttribute('data-priority', 'secondary')

		const footer = group.parentElement as HTMLElement
		await expect(footer.tagName).toBe('DIV')
		await expect(footer.children).toHaveLength(1)
	},
}

/**
 * How many `Button`s are kept: none leaves only the other content, one has no
 * priority (`hasPriority` needs two), two are `primary` then `secondary`, and a
 * third is dropped without a trace. Each footer also holds a non-`Button` note.
 */
export const ButtonCount: Story = {
	parameters: { controls: { exclude: ['children'] } },
	render: (args) => (
		<Row>
			{ BUTTON_COUNTS.map(count => (
				<Group key={ count } label={ `buttons: ${count}` }>
					{ footerSection({
						...args,
						children: [
							<span key="note">{ `Note ${count}` }</span>,
							...buttons(...Array.from({ length: count }, (_, i) => `Button ${count}-${i}`)),
						],
					}, { title: `Buttons: ${count}` }) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		const rootOf = (count: number) =>
			canvas.getByRole('heading', { name: `Buttons: ${count}` }).closest(ROOT_SELECTOR) as HTMLElement

		// The note is kept whatever the button count.
		for (const count of BUTTON_COUNTS)
			await expect(within(rootOf(count)).getByText(`Note ${count}`)).toBeInTheDocument()

		await expect(within(rootOf(0)).queryByRole('group')).not.toBeInTheDocument()
		await expect(within(rootOf(0)).queryByRole('button')).not.toBeInTheDocument()

		const one = within(rootOf(1)).getAllByRole('button')
		await expect(one).toHaveLength(1)
		await expect(one[0]).not.toHaveAttribute('data-priority')

		const [first, second] = within(rootOf(2)).getAllByRole('button')
		await expect(within(rootOf(2)).getAllByRole('button')).toHaveLength(2)
		await expect(first).toHaveAttribute('data-priority', 'primary')
		await expect(second).toHaveAttribute('data-priority', 'secondary')

		// A third `Button` is neither grouped nor moved into the actions `div`.
		await expect(within(rootOf(3)).getAllByRole('button')).toHaveLength(2)
		await expect(within(rootOf(3)).queryByRole('button', { name: 'Button 3-2' })).not.toBeInTheDocument()
		await expect(within(rootOf(3)).queryByText('Button 3-2')).not.toBeInTheDocument()
	},
}

/**
 * Anything that is not a `Button` goes into an actions `div` that comes BEFORE the
 * `Button.Group`, whatever order the children were written in.
 */
export const ContentAndButtons: Story = {
	args: {
		children: [
			<Button key="go">Go</Button>,
			<input key="search" aria-label="Search" />,
		],
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			input = canvas.getByRole('textbox', { name: 'Search' }),
			group = canvas.getByRole('group')

		await expect(within(group).getByRole('button', { name: 'Go' })).toBeInTheDocument()
		await expect(input.closest('[role="group"]')).toBeNull()

		// actions `div`, then the group, both direct children of the footer
		const actions = input.parentElement as HTMLElement
		await expect(actions.nextElementSibling).toBe(group)
		await expect(actions.parentElement).toBe(group.parentElement)
	},
}

/**
 * Edge case: a footer with no `Button` at all renders only the actions `div`, no
 * `Button.Group`.
 */
export const ContentOnly: Story = {
	args: { children: <span>Just a note</span> },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		await expect(canvas.getByText('Just a note')).toBeInTheDocument()
		await expect(canvas.queryByRole('group')).not.toBeInTheDocument()
		await expect(canvas.queryByRole('button')).not.toBeInTheDocument()
	},
}

/**
 * An explicit `size` sets the `Button.Group` gap token (`sm` and `md` share a gap,
 * `lg` is wider). The default layout provides `md` through context; the prop wins
 * over it either way.
 */
export const Size: Story = {
	parameters: { controls: { exclude: ['size'] } },
	render: (args) => (
		<Row>
			{ SIZE_OPTIONS.map(size => (
				<Group key={ size } label={ size }>
					{ footerSection({ ...args, size }, { title: `Size: ${size}` }) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		for (const size of SIZE_OPTIONS)
			await expect(gapOf(footerOf(canvasElement, `Size: ${size}`))).toBe(GROUP_GAP_BY_SIZE[size])

		await expect(GROUP_GAP_BY_SIZE.lg).not.toBe(GROUP_GAP_BY_SIZE.md)
	},
}

/**
 * With no `size` prop the footer takes it from `Section`'s context: `lg` for the
 * `hero` layout, `md` for every other one. A `size` prop overrides the context, as
 * the last group shows (`hero` provides `lg`, the prop asks for `sm`).
 */
export const SizeFromContext: Story = {
	parameters: { controls: { exclude: ['size'] } },
	render: (args) => (
		<Row>
			<Group label="layout: default">
				{ footerSection(args, { title: 'Context: default' }) }
			</Group>
			<Group label="layout: hero">
				{ footerSection(args, { layout: 'hero', title: 'Context: hero' }) }
			</Group>
			<Group label="layout: hero, size: sm">
				{ footerSection({ ...args, size: 'sm' }, { layout: 'hero', title: 'Context: hero sm' }) }
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		await expect(gapOf(footerOf(canvasElement, 'Context: default'))).toBe(GROUP_GAP_BY_SIZE.md)
		await expect(gapOf(footerOf(canvasElement, 'Context: hero'))).toBe(GROUP_GAP_BY_SIZE.lg)
		await expect(gapOf(footerOf(canvasElement, 'Context: hero sm'))).toBe(GROUP_GAP_BY_SIZE.sm)
	},
}

const noteAndButtons = (tag: string) => [
	<span key="note">{ `Note ${tag}` }</span>,
	...buttons(`${tag} first`, `${tag} second`),
]

/**
 * `revealFrom` staggers the reveal. The actions `div` takes the first slot and the
 * buttons the slots after it. Three cases: slots reserved by an animated `Section`
 * (title takes `0`, so the footer starts at `1`), an explicit prop on a
 * non-animated `Section` (the prop wins; nothing is reserved), and neither (no
 * `data-reveal-item` at all).
 */
export const RevealFrom: Story = {
	parameters: { controls: { exclude: ['children', 'revealFrom'] } },
	render: (args) => (
		<Row>
			<Group label="from Section (animated)">
				{ footerSection({ ...args, children: noteAndButtons('A') }, { title: 'Reveal: auto' }) }
			</Group>
			<Group label="revealFrom: 10, animated: false">
				{ footerSection(
					{ ...args, children: noteAndButtons('B'), revealFrom: 10 },
					{ animated: false, title: 'Reveal: prop' }
				) }
			</Group>
			<Group label="revealFrom: undefined, animated: false">
				{ footerSection(
					{ ...args, children: noteAndButtons('C') },
					{ animated: false, title: 'Reveal: none' }
				) }
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		const slotOf = (el: HTMLElement) => el.closest('[data-reveal-item]')

		// A: `Section` reserves 3 slots (note, 2 buttons) after the title's slot 0.
		await expect(slotOf(canvas.getByText('Note A'))).toHaveAttribute('data-reveal-item', '1')
		await expect(canvas.getByRole('button', { name: 'A first' })).toHaveAttribute('data-reveal-item', '2')
		await expect(canvas.getByRole('button', { name: 'A second' })).toHaveAttribute('data-reveal-item', '3')

		// B: the prop starts the range; the buttons follow the note.
		await expect(slotOf(canvas.getByText('Note B'))).toHaveAttribute('data-reveal-item', '10')
		await expect(canvas.getByRole('button', { name: 'B first' })).toHaveAttribute('data-reveal-item', '11')
		await expect(canvas.getByRole('button', { name: 'B second' })).toHaveAttribute('data-reveal-item', '12')

		// C: not animated, nothing reserved.
		await expect(slotOf(canvas.getByText('Note C'))).toBeNull()
		await expect(canvas.getByRole('button', { name: 'C first' })).not.toHaveAttribute('data-reveal-item')
		await expect(canvas.getByRole('button', { name: 'C second' })).not.toHaveAttribute('data-reveal-item')
	},
}

/**
 * In `hero-split` and `hero-tight`, `buildSection.tsx` (`buildContent`) puts
 * `{ as: Grid.Item, span: 1 }` in the footer's context, so the footer is a
 * `Grid.Item` that spans one column (`--grid-span-col: span 1`), beside the `span 3`
 * content item. `SectionFooter.tsx` hands the context's `as`/`span` to its `Box`
 * whenever `as` is set (`!!as ? { as, span } : { as: 'div' }`).
 */
export const HeroGridItem: Story = {
	parameters: { controls: { exclude: ['children'] } },
	render: (args) => (
		<Row>
			{ HERO_GRID_LAYOUTS.map(layout => (
				<Group key={ layout } label={ layout }>
					{ footerSection(args, { layout, title: `Footer: ${layout}` }) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		for (const layout of HERO_GRID_LAYOUTS) {
			const title = `Footer: ${layout}`,
				footer = footerOf(canvasElement, title),
				content = canvas.getByRole('heading', { name: title }).closest('[style*="--grid-span-col"]') as HTMLElement | null

			await expect(footer.style.getPropertyValue('--grid-span-col')).toBe('span 1')
			await expect(content?.style.getPropertyValue('--grid-span-col')).toBe('span 3')
			await expect(footer).not.toBe(content)
		}
	},
}

/**
 * Once the footer is a `Grid.Item` (see `HeroGridItem`), `grid-column: span 1` sets
 * `grid-column-start` to `span 1`; `grid-column-end` stays `auto`. Kept apart from
 * `HeroGridItem` because the computed value also depends on the `Grid.Item` CSS class
 * surviving the footer's own class, which the inline token check does not.
 */
export const HeroGridColumn: Story = {
	parameters: { controls: { exclude: ['children'] } },
	render: (args) => (
		<Row>
			{ HERO_GRID_LAYOUTS.map(layout => (
				<Group key={ layout } label={ layout }>
					{ footerSection(args, { layout, title: `Footer: ${layout}` }) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		for (const layout of HERO_GRID_LAYOUTS) {
			const style = getComputedStyle(footerOf(canvasElement, `Footer: ${layout}`))

			await expect(style.gridColumnStart).toBe('span 1')
			await expect(style.gridColumnEnd).toBe('auto')
		}
	},
}

/**
 * Every other layout gives the footer no grid context (`as`/`span` are `never`), so
 * it is a plain `div` with no `--grid-span-col` of its own.
 */
export const PlainLayouts: Story = {
	parameters: { controls: { exclude: ['children'] } },
	render: (args) => (
		<Row>
			{ PLAIN_LAYOUTS.map(layout => (
				<Group key={ layout } label={ layout }>
					{ footerSection(args, { layout, title: `Footer: ${layout}` }) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		for (const layout of PLAIN_LAYOUTS) {
			const footer = footerOf(canvasElement, `Footer: ${layout}`)

			await expect(footer.tagName).toBe('DIV')
			await expect(footer.style.getPropertyValue('--grid-span-col')).toBe('')
		}
	},
}

/**
 * `unstyled` keeps the semantic base class (`inkq-section__footer`) but drops the
 * CSS-module hash.
 */
export const Unstyled: Story = {
	parameters: { controls: { exclude: ['unstyled'] } },
	render: (args) => (
		<Row>
			{ BOOLEAN_OPTIONS.map(unstyled => (
				<Group key={ String(unstyled) } label={ String(unstyled) }>
					{ footerSection({ ...args, unstyled }, { title: `Unstyled: ${unstyled}` }) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const unstyledFooter =footerOf(canvasElement, 'Unstyled: true'),
			styledFooter = footerOf(canvasElement, 'Unstyled: false')

		const hasModuleClass = (el: Element, base: string) => {
			const moduleClass = (moduleClasses as Record<string, string>)[base]
			return !!moduleClass && el.classList.contains(moduleClass)
		}

		await expect(styledFooter).toHaveClass('inkq-section__footer')
		await expect(unstyledFooter).toHaveClass('inkq-section__footer')
		expect(hasModuleClass(styledFooter, 'inkq-section__footer')).toBe(true)
		expect(hasModuleClass(unstyledFooter, 'inkq-section__footer')).toBe(false)
	},
}

/**
 * Mouse behaviour: each button runs its own `onClick`, one call per click. The
 * reveal animation is off so nothing is mid-transition.
 */
export const Clickable: Story = {
	args: {
		children: [
			<Button key="first" onClick={ onFirst }>First</Button>,
			<Button key="second" onClick={ onSecond }>Second</Button>,
		],
	},
	render: (args) => footerSection(args, { animated: false, title: 'Clickable footer' }),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		onFirst.mockClear()
		onSecond.mockClear()

		await userEvent.click(canvas.getByRole('button', { name: 'First' }))
		await expect(onFirst).toHaveBeenCalledTimes(1)
		await expect(onSecond).toHaveBeenCalledTimes(0)

		await userEvent.click(canvas.getByRole('button', { name: 'Second' }))
		await expect(onFirst).toHaveBeenCalledTimes(1)
		await expect(onSecond).toHaveBeenCalledTimes(1)

		await userEvent.click(canvas.getByRole('button', { name: 'First' }))
		await expect(onFirst).toHaveBeenCalledTimes(2)
		await expect(onSecond).toHaveBeenCalledTimes(1)
	},
}

/**
 * Pure focus mechanics: Tab visits the footer in DOM order, so the actions `div`'s
 * input comes before the buttons, then the buttons in order.
 */
export const KeyboardFocus: Story = {
	args: {
		children: [
			<Button key="first">First</Button>,
			<input key="search" aria-label="Search" />,
			<Button key="second">Second</Button>,
		],
	},
	render: (args) => footerSection(args, { animated: false, title: 'Focus footer' }),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			input = canvas.getByRole('textbox', { name: 'Search' }),
			first = canvas.getByRole('button', { name: 'First' }),
			second = canvas.getByRole('button', { name: 'Second' })

		await expect(input).not.toHaveFocus()

		await userEvent.tab()
		await expect(input).toHaveFocus()

		await userEvent.tab()
		await expect(first).toHaveFocus()

		await userEvent.tab()
		await expect(second).toHaveFocus()

		// Explicit blur rather than tabbing away: where a further `tab()` lands is
		// browser/environment-dependent.
		second.blur()
		await expect(second).not.toHaveFocus()
	},
}

/**
 * Keyboard activation: both Enter and Space press a focused button, once each.
 */
export const KeyboardActivation: Story = {
	args: {
		children: [
			<Button key="first" onClick={ onFirst }>First</Button>,
			<Button key="second" onClick={ onSecond }>Second</Button>,
		],
	},
	render: (args) => footerSection(args, { animated: false, title: 'Keyboard footer' }),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			first = canvas.getByRole('button', { name: 'First' }),
			second = canvas.getByRole('button', { name: 'Second' })
		onFirst.mockClear()
		onSecond.mockClear()

		await userEvent.tab()
		await expect(first).toHaveFocus()

		await userEvent.keyboard('{Enter}')
		await expect(onFirst).toHaveBeenCalledTimes(1)
		await userEvent.keyboard(' ')
		await expect(onFirst).toHaveBeenCalledTimes(2)

		await userEvent.tab()
		await expect(second).toHaveFocus()

		await userEvent.keyboard('{Enter}')
		await expect(onSecond).toHaveBeenCalledTimes(1)
		await userEvent.keyboard(' ')
		await expect(onSecond).toHaveBeenCalledTimes(2)
		await expect(onFirst).toHaveBeenCalledTimes(2)
	},
}

/**
 * Edge case: `Section.Footer` reads a required `Section` context, so rendering it
 * on its own throws. An error boundary shows the message.
 */
export const OutsideSection: Story = {
	render: (args) => (
		<ErrorBoundary>
			<Section.Footer { ...args } />
		</ErrorBoundary>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		await expect(canvas.getByRole('alert')).toHaveTextContent(
			'Section: <Section.Footer /> must be a direct child of <Section>; it can\'t be returned from another component'
		)
		await expect(canvas.queryByRole('button')).not.toBeInTheDocument()
	},
}
