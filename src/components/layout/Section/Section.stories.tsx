import { expect, within } from 'storybook/test'
import { getDefaultProps } from '@/lib/registries'
import { Section } from './Section'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

// `layout` is the only genuine enum among `Grid`/`GridItem`/`Section`/`MenuItem`
// and has exactly one consumer (this file), so — per the Button/Badge/Container
// precedent — it stays a local const rather than living in a shared
// `options.story.ts`.
type SectionLayout = NonNullable<Section.Props['layout']>
const LAYOUT_OPTIONS: readonly SectionLayout[] = ['default', 'blocks', 'cta', 'hero', 'split'] as const

const Row = ({ children }: { children: ReactNode }) => (
	<div style={ { display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' } }>
		{ children }
	</div>
)

const Group = ({ label, children }: { label: string, children: ReactNode }) => (
	<div style={ { display: 'flex', flexDirection: 'column', gap: 8, minWidth: 320 } }>
		<span style={ { font: 'var(--inkq-text-control)', letterSpacing: '.15em', textTransform: 'uppercase', opacity: 0.6 } }>
			{ label }
		</span>
		{ children }
	</div>
)

// `Section`'s own semantic base class (`inkq-section`, always emitted by
// `getClassName` regardless of `unstyled`) is the stable selector used to walk
// from rendered content back up to the actual root element. NOTE: because
// `Section` renders `<Box as={Container} {...styles('root', { clsx })}>` (where
// `clsx = { [\`${NAME}--${layout}\`]: !!(layout && layout !== 'default') }`),
// the className it computes is passed straight into `Container` as a plain
// `className` prop; `getClassName`'s `inheritClasses` logic then treats that
// string's FIRST class (`inkq-section`) as the new "namespace" and it
// overwrites/replaces `Container`'s own semantic base class (`inkq-container`)
// entirely — so `.inkq-container` never appears in the rendered DOM here, only
// `.inkq-section` (plus `Container`'s own CSS-module-hashed class, and any
// `inkq-section--<layout>` modifier). This is the same "parent's `styles(child)`
// replaces the child's own base class" pattern seen elsewhere in this codebase.
const ROOT_SELECTOR = '.inkq-section'

// `Section.Props` (the `declare namespace` export) is just the raw
// `SectionProps` interface — it doesn't include `as`/`unstyled`/`attributes`/
// etc., which only exist on the actual accepted prop type,
// `PolymorphicProps<SectionProps, C>`. `Parameters<typeof Section>[0]` reads
// that real, wrapped type straight off the component itself.
type SectionStoryProps = Parameters<typeof Section>[0]
type Story = StoryObj<SectionStoryProps>

const meta: Meta<SectionStoryProps> = {
	component: Section,
	title: 'Layout/Section',
	argTypes: {
		as: {
			control: false,
			description: 'Accepted (via the shared `PolymorphicProps`/`Box` contract) but silently IGNORED — `Section.tsx` destructures `others` from `extractOtherProps(rest)` but never reads the sibling `as` value it also returns, and always hardcodes `<Box as={Container} ...>`. Passing `as="div"` has zero effect on the rendered tag (always `Container`\'s own default, `<section>`); see the `AsPropIgnored` story.',
		},
		eyebrow: {
			control: 'text',
			description: '**Re-verified against the live `Section.tsx`**: rendered CONDITIONALLY — `{ eyebrow && <span {...styles(\'eyebrow\', { clsx: \'eyebrow\' })}>{eyebrow}</span> }`. When `eyebrow` is falsy (`undefined`/`\'\'`), the `<span>` isn\'t rendered at all — there is no longer an empty placeholder span in the DOM. See the `Eyebrow` story.',
		},
		layout: {
			control: 'select',
			options: LAYOUT_OPTIONS,
			description: 'Changes the heading tag (`h1` for `hero`, `h2` otherwise) and the content wrapper: `hero`/`cta` wrap in a plain `<div class="inkq-section__inner">`, `split` wraps in a two-`Grid.Item` `Grid`, and `default`/`blocks` render the header/content with no wrapper element at all (`blocks` falls through `buildSection`\'s `switch` to the same `default:` branch as `\'default\'`). Also toggles the `inkq-section--<layout>` modifier class for every value except `\'default\'` (`blocks` included — see `Section.module.scss`\'s `&--blocks { padding-block: 0; }` rule). See the `Layout` story.',
		},
		title: {
			control: 'text',
			description: '**Re-verified against the live `Section.tsx`**: now OPTIONAL (`title?: string`), rendered CONDITIONALLY — `{ title && <Box as={HTag}>{title}</Box> }`. When `title` is falsy, no heading element is rendered at all. See the `NoTitle` story.',
		},
		children: {
			control: false,
			description: 'Passed through `orderSection` (see the `ContentComposition` story) rather than rendered as-is: string children become a description paragraph, and any `isValidElement` child whose `type !== Button` is treated as ordinary content while a genuine `Section.Button` (up to 2) becomes a CTA `Button.Group` entry.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Part of `PolymorphicProps` (via the shared `SpecsContract`), not `Section`\'s own `SectionProps`. The semantic base class (`inkq-section`) is ALWAYS emitted regardless of this prop — `unstyled` only suppresses the CSS-module-hashed class normally appended alongside it.',
		},
	},
	args: {
		...getDefaultProps<Section.Props>('Section'),
		title: 'Section title',
	},
}

export default meta

export const Default: Story = {
	args: {
		eyebrow: 'Eyebrow',
		children: 'A short description of this section.',
	},
	parameters: { layout: 'padded' },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			heading = canvas.getByRole('heading', { level: 2 })

		await expect(heading).toHaveTextContent('Section title')
		await expect(canvas.getByText('Eyebrow')).toBeInTheDocument()
		await expect(canvas.getByText('A short description of this section.').tagName).toBe('P')

		const root = heading.closest(ROOT_SELECTOR) as HTMLElement
		await expect(root.tagName).toBe('SECTION')
		// `layout: 'default'` adds no `inkq-section--*` modifier class.
		await expect(Array.from(root.classList).some(c => c.startsWith('inkq-section--'))).toBe(false)
	},
}

/**
 * All five `layout` values, side by side. `buildSection` (`Section.tsx`'s
 * `switch (layout)`) branches on `layout` for exactly two things: the heading
 * tag (`h1` for `hero`, `h2` for everything else) and the content wrapper
 * (`hero`/`cta` → plain `<div>`, `split` → a two-`Grid.Item` `Grid`,
 * `default`/`blocks` → no wrapper element at all, just the header/content
 * inline — `blocks` isn't its own `case`, so it falls through to the same
 * `default:` branch as `'default'`). Separately, the ROOT modifier class
 * (`inkq-section--<layout>`) is toggled for every value EXCEPT `'default'`
 * (`Section.tsx`'s `clsx = { [...]: !!(layout && layout !== 'default') }`),
 * so `blocks` DOES get a modifier class even though it has no wrapper — the
 * two behaviors are independent.
 */
export const Layout: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['layout'] },
	},
	render: (args) => (
		<Row>
			{ LAYOUT_OPTIONS.map(layout => (
				<Group key={ layout } label={ layout }>
					<Section
						{ ...args }
						layout={ layout }
						title={ `Layout: ${ layout }` }
					>
						A description that appears in every layout.
						<Section.Button>Learn more</Section.Button>
						<Section.Button>View more</Section.Button>
					</Section>
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		const defaultHeading = canvas.getByRole('heading', { name: 'Layout: default' }),
			blocksHeading = canvas.getByRole('heading', { name: 'Layout: blocks' }),
			ctaHeading = canvas.getByRole('heading', { name: 'Layout: cta' }),
			heroHeading = canvas.getByRole('heading', { name: 'Layout: hero' }),
			splitHeading = canvas.getByRole('heading', { name: 'Layout: split' })

		// Only `hero` renders an `h1`; every other layout renders an `h2`.
		await expect(heroHeading.tagName).toBe('H1')
		await expect(defaultHeading.tagName).toBe('H2')
		await expect(blocksHeading.tagName).toBe('H2')
		await expect(ctaHeading.tagName).toBe('H2')
		await expect(splitHeading.tagName).toBe('H2')

		const defaultRoot = defaultHeading.closest(ROOT_SELECTOR) as HTMLElement,
			blocksRoot = blocksHeading.closest(ROOT_SELECTOR) as HTMLElement,
			ctaRoot = ctaHeading.closest(ROOT_SELECTOR) as HTMLElement,
			heroRoot = heroHeading.closest(ROOT_SELECTOR) as HTMLElement,
			splitRoot = splitHeading.closest(ROOT_SELECTOR) as HTMLElement

		// `outputExtraClasses` (`getClassName.tsx`) substitutes the CSS-module
		// HASH for a `clsx` modifier when a matching rule exists in the
		// stylesheet (unlike the always-present-alongside-its-hash root/selector
		// base classes) — since `Section.module.scss` defines real `--blocks`/
		// `--cta`/`--hero`/`--split` rules, the literal `inkq-section--<layout>`
		// token never appears verbatim in the DOM; only its hash (e.g.
		// `_inkq-section--cta_nmvr1_34`) does. Module-generated hashes preserve
		// the original name as a substring, so assert via `className` substring
		// matching rather than `toHaveClass`'s exact-token match.
		await expect(defaultRoot.className).not.toMatch('inkq-section--')
		await expect(blocksRoot.className).toMatch('inkq-section--blocks')
		await expect(ctaRoot.className).toMatch('inkq-section--cta')
		await expect(heroRoot.className).toMatch('inkq-section--hero')
		await expect(splitRoot.className).toMatch('inkq-section--split')

		// `hero`/`cta` wrap the header + content in a plain `.inkq-section__inner`
		// div. Queried by walking up from the heading itself, not via a selector
		// chain through `Container`'s own internal wrapper — `Container`'s
		// `styles('wrapper')` call inherits and mangles its computed class name
		// once rendered via `Section`'s `<Box as={Container}>` (see the
		// `styles(child)`-inheritance note above `ROOT_SELECTOR`), so its exact
		// className isn't a stable thing to assert against here.
		await expect(heroHeading.closest('.inkq-section__inner')).toBeInTheDocument()
		await expect(ctaHeading.closest('.inkq-section__inner')).toBeInTheDocument()

		// `default` AND `blocks` both fall through to `buildSection`'s
		// `default:` branch — no wrapper element at all around the header/content.
		await expect(defaultHeading.closest('.inkq-section__inner')).not.toBeInTheDocument()
		await expect(blocksHeading.closest('.inkq-section__inner')).not.toBeInTheDocument()

		// `split` wraps the header and content in two separate `Grid.Item`s.
		await expect(splitRoot.querySelectorAll('.inkq-grid-item')).toHaveLength(2)

		// The CTA `Button.Group` renders identically regardless of `layout`.
		for (const root of [defaultRoot, blocksRoot, ctaRoot, heroRoot, splitRoot]) {
			await expect(within(root).getByRole('group')).toBeInTheDocument()
			await expect(within(root).getAllByRole('button')).toHaveLength(2)
		}
	},
}

/**
 * **Re-verified against the LIVE `Section.tsx`**: `eyebrow` is now genuinely
 * conditional — `{ eyebrow && <span {...styles('eyebrow', { clsx: 'eyebrow' })}>
 * {eyebrow}</span> }`. When `eyebrow` is falsy, there is NO `<span>` in the DOM
 * at all (previously it rendered an always-present, empty span — that's no
 * longer the case).
 */
export const Eyebrow: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['eyebrow'] },
	},
	render: (args) => (
		<Row>
			<Group label='eyebrow="New Arrivals"'>
				<Section { ...args } eyebrow="New Arrivals" title="With an eyebrow" />
			</Group>
			<Group label="eyebrow: undefined">
				<Section { ...args } eyebrow={ undefined } title="Without an eyebrow" />
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			withEyebrow = canvas.getByRole('heading', { name: 'With an eyebrow' })
				.closest(ROOT_SELECTOR) as HTMLElement,
			withoutEyebrow = canvas.getByRole('heading', { name: 'Without an eyebrow' })
				.closest(ROOT_SELECTOR) as HTMLElement

		const withEyebrowSpan = withEyebrow.querySelector('.inkq-section__eyebrow'),
			withoutEyebrowSpan = withoutEyebrow.querySelector('.inkq-section__eyebrow')

		await expect(withEyebrowSpan).toBeInTheDocument()
		await expect(withEyebrowSpan).toHaveTextContent('New Arrivals')

		// The span is no longer rendered at all when `eyebrow` is falsy — not
		// present-but-empty, genuinely absent from the DOM.
		await expect(withoutEyebrowSpan).not.toBeInTheDocument()
	},
}

/**
 * **New coverage, tracking a real source change**: `title` was previously a
 * required `string`; it's now `title?: string` and rendered conditionally —
 * `{ title && <Box as={HTag}>{title}</Box> }` (`Section.tsx`). When `title`
 * is falsy, no heading element is rendered at all (mirroring `eyebrow`'s own
 * conditional, see the `Eyebrow` story above).
 */
export const NoTitle: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['title'] },
	},
	render: (args) => (
		<Row>
			<Group label='title="With a title"'>
				<Section { ...args } title="With a title">
					Section with a title.
				</Section>
			</Group>
			<Group label="title: undefined">
				<Section { ...args } title={ undefined }>
					Section without a title.
				</Section>
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		const withTitleRoot = canvas.getByRole('heading', { name: 'With a title' })
			.closest(ROOT_SELECTOR) as HTMLElement
		await expect(withTitleRoot).toBeInTheDocument()

		const withoutTitleRoot = canvas.getByText('Section without a title.')
			.closest(ROOT_SELECTOR) as HTMLElement

		// No heading element at all — not an empty one, genuinely absent.
		await expect(within(withoutTitleRoot).queryByRole('heading')).not.toBeInTheDocument()
	},
}

/**
 * Correct, non-buggy usage: a string description plus TWO `Section.Button`
 * children. `orderSection` (`Section.tsx`) pushes the string into
 * `content` and both buttons into `buttons` (the `else if` branch — see the
 * `OrderSectionDoublePushBug`-removal note further down for why that guard
 * means there's no bug left to reproduce here).
 *
 * IMPORTANT: `children` is passed via `render` with genuine JSX children
 * (`<Section>text<Section.Button>...</Section.Button>...</Section>`), NOT as
 * a `<>...</>` fragment assigned to `args.children`. A JSX `<>...</>` shorthand
 * compiles to a SINGLE `Fragment` element — from `orderSection`'s perspective
 * (`Children.toArray(children)`), that's ONE child whose `type === Fragment`,
 * not three separate children, so the string never reaches the
 * `typeof child === 'string'` branch and the whole fragment gets pushed into
 * `content` as one opaque, wrapper-less node instead of becoming a `<p>`.
 * Passing multiple literal JSX children (as below) makes React itself hand
 * `Section` a real array of 3 distinct children instead.
 */
export const ContentComposition: Story = {
	args: { eyebrow: 'Featured' },
	render: (args) => (
		<Section { ...args }>
			A single string child becomes one description paragraph.
			<Section.Button>Learn more</Section.Button>
			<Section.Button>View more</Section.Button>
		</Section>
	),
	parameters: { layout: 'padded' },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		const description = canvas.getByText('A single string child becomes one description paragraph.')
		await expect(description.tagName).toBe('P')

		const group = canvas.getByRole('group')
		await expect(within(group).getAllByRole('button')).toHaveLength(2)
		await expect(within(group).getByRole('button', { name: 'Learn more' })).toBeInTheDocument()
		await expect(within(group).getByRole('button', { name: 'View more' })).toBeInTheDocument()
	},
}

// NOTE: an earlier pass of this file included an `OrderSectionDoublePushBug`
// story documenting a real bug in `orderSection`'s `buttons`-push guard
// (a non-`Button` element among the first two children used to be pushed into
// BOTH `content` and `buttons`, rendering it twice and silently dropping a
// legitimate third `Button`). Re-verified against the LIVE source: the
// `buttons` push is now gated with `else if (buttons.length < 2)` rather than
// a second unconditional `if`, so a non-`Button` element can no longer reach
// the `buttons` array at all — the double-push no longer reproduces. Story
// removed; flagging here so its removal isn't mistaken for a regression.

// `children` is required at the type level but nothing stops it from being
// `null` — `Children.toArray(null)` is `[]`, so `orderSection` returns an
// empty fragment and only the header (eyebrow + title) renders.
export const MinimalContent: Story = {
	args: {
		title: 'Title only',
		eyebrow: undefined,
		children: null,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		await expect(canvas.getByRole('heading', { name: 'Title only' })).toBeInTheDocument()
		await expect(canvas.queryByRole('group')).not.toBeInTheDocument()
	},
}

// `Section.tsx` computes `as`/`others` via `extractOtherProps(rest)` but only
// ever reads `others` — the `as` value is discarded, and the root is always
// rendered via the hardcoded `<Box as={Container}>`. Passing `as="div"` has no
// effect on the rendered tag.
//
// NOTE: `SectionSpecs` declares no `default.component`, so `polymorphic()`'s
// non-polymorphic call-signature branch types `as` as `never` (only
// `undefined` is assignable) — matching the fact that it's genuinely inert at
// runtime too. The `as={ 'div' as never }` cast below is the narrowest
// possible escape hatch for that one value, scoped to this single attribute.
export const AsPropIgnored: Story = {
	args: { title: 'as is ignored' },
	render: (args) => <Section { ...args } as={ 'div' as never } />,
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			root = canvas.getByRole('heading', { name: 'as is ignored' })
				.closest(ROOT_SELECTOR) as HTMLElement

		await expect(root.tagName).toBe('SECTION')
	},
}

/**
 * `unstyled` does NOT remove `Section`'s semantic base class (`inkq-section`)
 * — per `getClassName.tsx` the base class is now ALWAYS emitted. It only
 * suppresses the CSS-module-hashed class SECTION'S OWN `styles('root')` call
 * would otherwise add.
 *
 * **Real, verified quirk**: `unstyled` can only ever suppress `Section`'s OWN
 * hash — it can never suppress `Container`'s. `Section` never destructures
 * `unstyled` out of `rest`, so it flows through `others` and IS forwarded as
 * a prop to `<Box as={Container} ...{others}>`. But `Box.tsx` itself
 * destructures AND DISCARDS `unstyled` before spreading the remaining props
 * onto whatever `as` element/component it renders (`const {as, unstyled,
 * ...props} = handleProps(_props); return <Element {...props} />`) — so
 * `Container` never actually receives an `unstyled` prop at all, and always
 * computes `check.isUnstyled = false` for its own `styles('root')` call.
 * Its hashed root class is therefore unsuppressible via `Section`, in both
 * the styled AND unstyled cases — the only observable difference `unstyled`
 * makes is whether SECTION'S OWN extra hash is also present, i.e. a genuine
 * class-COUNT difference (3 vs 2 classes), not "has a hash" vs "has none".
 */
export const Unstyled: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['unstyled'] },
	},
	render: (args) => (
		<Row>
			{ ([true, false] as const).map(unstyled => (
				<Group key={ String(unstyled) } label={ String(unstyled) }>
					<Section
						{ ...args }
						unstyled={ unstyled }
						title={ `unstyled=${ unstyled }` }
					/>
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			unstyledRoot = canvas.getByRole('heading', { name: 'unstyled=true' })
				.closest(ROOT_SELECTOR) as HTMLElement,
			styledRoot = canvas.getByRole('heading', { name: 'unstyled=false' })
				.closest(ROOT_SELECTOR) as HTMLElement

		await expect(styledRoot).toHaveClass('inkq-section')
		await expect(unstyledRoot).toHaveClass('inkq-section')

		// Both retain a module-hashed class (`Container`'s own, which `Section`'s
		// `unstyled` can never reach) — the real difference is SECTION's own
		// extra hash, so compare class COUNTS rather than "has any hash at all".
		await expect(styledRoot.classList.length).toBeGreaterThan(unstyledRoot.classList.length)
	},
}
