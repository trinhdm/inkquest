import { expect, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { Section } from './Section'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import containerClasses from '../Container/Container.module.scss'
import { Button } from '@/components/core/Button'

// `layout` is the only enum among `Section`'s own props and has exactly one
// consumer (this file), so it stays a local const rather than living in a
// shared `options.story.ts`. (`Grid`'s `gap` is also an enum, but it is a
// `Grid` prop, kept local to `Grid.stories.tsx`.)
type SectionLayout = NonNullable<Section.Props['layout']>

const LAYOUT_OPTIONS: readonly SectionLayout[] = [
	'default',
	'banner',
	'blocks',
	'hero',
	'hero-split',
	'split',
] as const

const BUTTON_LABELS: string[] = ['Learn more', 'View more']

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

// A plain function that RETURNS the footer element — call it
// (`{ buttonFooter() }`), never render it as `<ButtonFooter />`. `Section`'s
// `sortContent` (`builder.tsx`) only recognizes a DIRECT `Section.Footer`
// child (`child.type === SectionFooter`) and only wraps that one in the
// section context provider; a wrapper component would be treated as ordinary
// body content and the footer inside it would throw for lacking that context.
const buttonFooter = (labels: string[] = BUTTON_LABELS) => (
	<Section.Footer>
		{ labels.map(label => <Button key={ label }>{ label }</Button>) }
	</Section.Footer>
)

// `Section`'s own semantic base class (`inkq-section`, always emitted by
// `getClassName` regardless of `unstyled`) is the stable selector used to walk
// from rendered content back up to the actual root element. NOTE: because
// `Section` renders `<Box as={Container} {...styles('root', { module })}>`
// (where `module = { [\`${layout}\`]: !!(layout && layout !== 'default') }`),
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

// `SectionProps` is an INTERSECTION that contains the union
// (`BaseSectionProps & LayoutSectionProps & MaybeAnimationProps`), not a
// top-level union, so `Extract`/`Exclude` can't select a branch off it —
// `Extract` collapses to `never` and `Exclude` silently returns the whole
// type. Each use site supplies the discriminant explicitly in JSX right
// after the spread, so the cast's job is to REMOVE the discriminant-governed
// keys from the spread and let the explicit props pick the branch.
//
// `blocks` forbids `title`/`eyebrow` entirely (`SectionBlocksProps`), so they
// come off the spread too.
type SectionBlocksArgs = Omit<SectionStoryProps, 'eyebrow' | 'layout' | 'title'>
type SectionContentArgs = Omit<SectionStoryProps, 'layout'>

// Same treatment for `MaybeAnimationProps`'s union
// (`src/hooks/animation/constants.ts`): both groups set `animated`/`duration`/
// `stagger` explicitly, so all three come off the spread.
type AnimatedSectionArgs = Omit<SectionStoryProps, 'animated' | 'duration' | 'stagger'>
type StaticSectionArgs = AnimatedSectionArgs

type Story = StoryObj<SectionStoryProps>

const meta: Meta<SectionStoryProps> = {
	component: Section,
	title: 'Layout/Section',
	argTypes: {
		as: {
			control: false,
			description: 'NOT part of `Section`\'s accepted props. Per `specs.types.ts`, `IsPolymorphic<S>` is true only when `S[\'defaults\'][\'as\']` is an `ElementType`; `SectionSpecs` declares `defaults: { props: ... }` with no `as`, so `AsPolymorphic` resolves to `{ as?: never }` — only `undefined` is assignable and passing a tag is a type error. `Section` correspondingly hardcodes its root as `<Box as={Container} ...>`, whose own default tag is `<section>`. This is a different route to the same fixed-tag contract than the compound parts (`Grid.Item`, `Group.Item`, ...), which get there via `isCompound: true` forcing `defaults.as?: never`. See the `FixedTag` story.',
		},
		eyebrow: {
			control: 'text',
			description: '**Re-verified against the live `Section.tsx`/`builder.tsx`/`getClassName.tsx`**: rendered CONDITIONALLY — `buildHeader` pushes `{ eyebrow && <span {...styles(\'eyebrow\', true)} {...reveal.next()}>{eyebrow}</span> }`. The semantic base class (`inkq-section__eyebrow`, from `nameClassBase`, always emitted) is NOT the whole story: the `true` shorthand ALSO runs `getConfigClasses`\' boolean branch (`getClassName.tsx`: `if (typeof config === \'boolean\' && config) return getBaseClass(selector, prefix)`), which computes a SEPARATE, literal, unhashed GLOBAL class — `inkq-eyebrow` (styled by `styles/_base.scss`\'s own `.inkq-eyebrow` rule), stacked alongside the semantic base class. `check.isUnstyled` is now checked FIRST in `getConfigClasses`, before that boolean branch, so `inkq-eyebrow` is suppressed entirely when `unstyled` (same mechanism as `Container`\'s `styles(\'wrapper\', true)`-driven `inkq-wrapper` — see `Container.stories.tsx`\'s `unstyled` argType description, which now behaves identically to an OBJECT config). Not currently exercised by any story here beyond this doc note — `Section`\'s own `Unstyled` story doesn\'t render `eyebrow` at all. When `eyebrow` is falsy (`undefined`/`\'\'`), neither class renders at all — the `<span>` isn\'t rendered. Forbidden entirely (`never`) when `layout: \'blocks\'` — see `SectionBlocksProps`. See the `Eyebrow` story.',
		},
		layout: {
			control: 'select',
			options: LAYOUT_OPTIONS,
			description: 'Changes the heading tag (`h1` for `hero` and `hero-split`, `h2` otherwise) and the content wrapper: `hero`/`banner` wrap in a plain `<div class="inkq-section__inner">`, `split` wraps in a two-`Grid.Item` `Grid`, `hero-split` wraps in a 4-column `Grid` (header and body in a `span 3` item, footer in a `span 1` item, and the `h1-display` class on the heading), and `default`/`blocks` render the header/content with no wrapper element at all (`blocks` falls through `buildSection`\'s `switch` to the same `default:` branch as `\'default\'`). Also toggles the `inkq-section--<layout>` modifier class for every value except `\'default\'` (`blocks` included — see `Section.module.scss`\'s `&--blocks { padding-block: 0; }` rule). `layout: \'blocks\'` (`SectionBlocksProps`) additionally FORBIDS `title`/`eyebrow` at the type level — see the `Layout` story\'s `blocks` group.',
		},
		title: {
			control: 'text',
			description: '**Re-verified against the live `builder.tsx`**: optional (`title?: string`), rendered CONDITIONALLY as a BARE tag, not a `Box` — `buildHeader` builds `<Tag {...styles(\'title\', clsx)} {...reveal.next()}>{title}</Tag>` when `title` is truthy, where `Tag` is `\'h1\'`/`\'h2\'` depending on `layout`. When `title` is falsy, no heading element is rendered at all. Forbidden entirely (`never`) when `layout: \'blocks\'` — see `SectionBlocksProps`. See the `NoTitle` story.',
		},
		children: {
			control: false,
			description: 'Sorted by `sortContent` in `builder.tsx` (see the `ContentComposition` story) rather than rendered as-is: string children become a description paragraph, other valid elements are ordinary content, and a DIRECT `Section.Footer` child is pulled out and rendered after the body inside the section context. Only the FIRST `Section.Footer` is kept; extras are dropped with a `console.warn` (see the `MultipleFooters` story). Also: a `Fragment` child is wrapped in a `<p class="inkq-prose">` (it is treated like text, not ordinary content), and a number child is dropped entirely (neither a string nor a valid element). A `Section.Footer` nested INSIDE a `Fragment` is NOT detected as the footer — `sortContent` only checks direct children — so it is treated as Fragment content and rendered outside the section context provider (see `FooterRevealSlot` for the supported, direct-child form).',
		},
		animated: {
			control: 'boolean',
			description: 'Discriminates `MaybeAnimationProps`: `animated: true` REQUIRES `duration` (registered default `600`; also allows `stagger`/`amount`/`once`/`lead`/`margin`); leaving `animated` unset or `false` means `duration`/`stagger`/etc. must be unset at the type level. The registered default is `animated: true` (alongside `duration: 600`, `stagger: 150`, `layout: \'default\'`), so an unset `animated` is animated at runtime. Drives `useReveal`\'s `isAnimated` gate (`animated && !unstyled`), which controls whether the deterministic `data-js-reveal` root attribute (and per-item `data-reveal-item` attributes) are applied at all. See the `Animated` story.',
		},
		duration: {
			control: 'number',
			description: 'Only valid alongside `animated: true`. Feeds the inline `--reveal-duration` CSS custom property (`defineTokens`\'s `tokens`, formatted `${duration}ms`) — computed purely off `props.duration`, independent of whether `animated` is actually `true`. Registered default is `600`. See the `Animated` story.',
		},
		stagger: {
			control: 'number',
			description: 'Only valid alongside `animated: true`. Feeds the inline `--reveal-stagger` CSS custom property the same way `duration` feeds `--reveal-duration` — computed purely off `props.stagger`, independent of `animated`. Registered default is `150`. See the `Animated` story.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Part of the factory\'s `FactoryContract` (`_PolymorphicContract.unstyled`), not `Section`\'s own `SectionProps`. The semantic base class (`inkq-section`) is emitted regardless of this prop (`namespace ?? baseName`). When `unstyled` is true, `Section` loses: the CSS-module hash, the `inkq-section--<layout>` modifier hash/class (`module` config), the eyebrow `inkq-eyebrow` and title `h1-display` global config classes, and the inline `--reveal-duration`/`--reveal-stagger` tokens. `useReveal` also treats it as non-animated (`animated && !rest.unstyled`), so no `data-js-reveal`/`data-reveal-item` attributes. It also flows on through to `Container` itself: `Section` never destructures `unstyled` out of `rest`, so it survives into `others` and reaches `<Box as={Container} {...others}>`, and `Box.tsx` forwards its own `unstyled` prop to the `as` target whenever that target carries `POLYMORPHIC_MARKER` — which `Container` does, being built via `polymorphic()`. See the `Unstyled` story for the resulting effect on `Container`\'s own wrapper hash.',
		},
	},
	args: {
		...getDefaultProps<Section.Props>('Section'),
	},
}

export default meta

export const Default: Story = {
	args: {
		title: 'Section title',
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
 * Every `layout` value, side by side. `buildSection` (`builder.tsx`'s
 * `switch (layout)`) branches on `layout` for exactly two things: the heading
 * tag (`h1` for `hero` and `hero-split`, `h2` for everything else) and the
 * content wrapper (`hero`/`banner` → plain `<div>`, `split` → a two-`Grid.Item`
 * `Grid`, `hero-split` → a 4-column `Grid` with a `span 3` content item and a
 * `span 1` footer item, `default`/`blocks` → no wrapper element at all, just the header/content
 * inline — `blocks` isn't its own `case`, so it falls through to the same
 * `default:` branch as `'default'`). Separately, the ROOT modifier class
 * (`inkq-section--<layout>`) is toggled for every value EXCEPT `'default'`
 * (`Section.tsx`'s `module = { [\`${layout}\`]: !!(layout && layout !== 'default') }`),
 * so `blocks` DOES get a modifier class even though it has no wrapper — the
 * two behaviors are independent.
 *
 * The `blocks` group mirrors `SectionBlocksProps` (`title`/`eyebrow` both
 * `never`) — no heading is rendered for it at all, unlike every other layout.
 */
export const Layout: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['layout', 'title', 'eyebrow'] },
	},
	render: (args) => (
		<Row>
			{ LAYOUT_OPTIONS.map(layout => (
				<Group key={ layout } label={ layout }>
					{ layout === 'blocks' ? (
						<Section { ...args as SectionBlocksArgs } layout="blocks">
							{ `A description for the ${ layout } layout.` }
							{ buttonFooter() }
						</Section>
					) : (
						<Section { ...args as SectionContentArgs } layout={ layout } title={ `Layout: ${ layout }` }>
							{ `A description for the ${ layout } layout.` }
							{ buttonFooter() }
						</Section>
					) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		const defaultHeading = canvas.getByRole('heading', { name: 'Layout: default' }),
			bannerHeading = canvas.getByRole('heading', { name: 'Layout: banner' }),
			heroHeading = canvas.getByRole('heading', { name: 'Layout: hero' }),
			heroSplitHeading = canvas.getByRole('heading', { name: 'Layout: hero-split' }),
			splitHeading = canvas.getByRole('heading', { name: 'Layout: split' })

		// `blocks` renders NO heading at all — `title`/`eyebrow` are forbidden by
		// `SectionBlocksProps`, so its root is located via its description text.
		const blocksRoot = canvas.getByText('A description for the blocks layout.')
			.closest(ROOT_SELECTOR) as HTMLElement
		await expect(within(blocksRoot).queryByRole('heading')).not.toBeInTheDocument()

		// `hero` and `hero-split` render an `h1`; every other layout renders an `h2`.
		await expect(heroHeading.tagName).toBe('H1')
		await expect(heroSplitHeading.tagName).toBe('H1')
		await expect(defaultHeading.tagName).toBe('H2')
		await expect(bannerHeading.tagName).toBe('H2')
		await expect(splitHeading.tagName).toBe('H2')

		// Only `hero-split` adds the `h1-display` global class to its heading.
		await expect(heroSplitHeading).toHaveClass('inkq-h1-display')
		await expect(heroHeading).not.toHaveClass('inkq-h1-display')

		const defaultRoot = defaultHeading.closest(ROOT_SELECTOR) as HTMLElement,
			bannerRoot = bannerHeading.closest(ROOT_SELECTOR) as HTMLElement,
			heroRoot = heroHeading.closest(ROOT_SELECTOR) as HTMLElement,
			heroSplitRoot = heroSplitHeading.closest(ROOT_SELECTOR) as HTMLElement,
			splitRoot = splitHeading.closest(ROOT_SELECTOR) as HTMLElement

		// `formatConfigClass`/`getStyleClass` (`getClassName.tsx`) substitute the
		// CSS-module HASH for a `module` modifier when a matching rule exists in
		// the stylesheet (unlike the always-present-alongside-its-hash root/selector
		// base classes) — since `Section.module.scss` defines real `--blocks`/
		// `--banner`/`--hero`/`--hero-split`/`--split` rules, the literal
		// `inkq-section--<layout>` token never appears verbatim in the DOM; only
		// its hash (e.g. `_inkq-section--banner_nmvr1_34`) does. Module-generated hashes preserve
		// the original name as a substring, so assert via `className` substring
		// matching rather than `toHaveClass`'s exact-token match.
		await expect(defaultRoot.className).not.toMatch('inkq-section--')
		await expect(blocksRoot.className).toMatch('inkq-section--blocks')
		await expect(bannerRoot.className).toMatch('inkq-section--banner')
		await expect(heroRoot.className).toMatch('inkq-section--hero')
		await expect(heroSplitRoot.className).toMatch('inkq-section--hero-split')
		await expect(splitRoot.className).toMatch('inkq-section--split')

		// `hero`/`banner` wrap the header + content in a plain `.inkq-section__inner`
		// div. Queried by walking up from the heading itself, not via a selector
		// chain through `Container`'s own internal wrapper — `Container`'s
		// `styles('wrapper')` call inherits and mangles its computed class name
		// once rendered via `Section`'s `<Box as={Container}>` (see the
		// `styles(child)`-inheritance note above `ROOT_SELECTOR`), so its exact
		// className isn't a stable thing to assert against here.
		await expect(heroHeading.closest('.inkq-section__inner')).toBeInTheDocument()
		await expect(bannerHeading.closest('.inkq-section__inner')).toBeInTheDocument()

		// `default` AND `blocks` both fall through to `buildSection`'s
		// `default:` branch — no wrapper element at all around the header/content.
		await expect(defaultHeading.closest('.inkq-section__inner')).not.toBeInTheDocument()
		await expect(blocksRoot.querySelector('.inkq-section__inner')).not.toBeInTheDocument()

		// `split` wraps the header and content in two separate `Grid.Item`s.
		await expect(splitRoot.querySelectorAll('.inkq-grid-item')).toHaveLength(2)

		// `hero-split` is a 4-column `Grid`: the header/body item spans 3
		// columns and the footer item spans 1. Located via the inline
		// `--grid-span-col` token, since `Section` hands those items its own
		// `content`/`cta` classes.
		const heroSplitGrid = heroSplitHeading.closest('.inkq-section__inner') as HTMLElement,
			contentItem = heroSplitHeading.closest('[style*="--grid-span-col"]') as HTMLElement,
			ctaItem = within(heroSplitRoot).getByRole('group').closest('[style*="--grid-span-col"]') as HTMLElement

		await expect(heroSplitGrid.style.getPropertyValue('--grid-cols')).toBe('4')
		await expect(contentItem.style.getPropertyValue('--grid-span-col')).toBe('span 3')
		await expect(ctaItem.style.getPropertyValue('--grid-span-col')).toBe('span 1')
		await expect(contentItem).not.toBe(ctaItem)

		// The footer's `Button.Group` renders identically regardless of `layout`.
		for (const root of [defaultRoot, blocksRoot, bannerRoot, heroRoot, heroSplitRoot, splitRoot]) {
			await expect(within(root).getByRole('group')).toBeInTheDocument()
			await expect(within(root).getAllByRole('button')).toHaveLength(2)
		}
	},
}

/**
 * **Re-verified against the LIVE `Section.tsx`/`builder.tsx`**: `eyebrow` is
 * genuinely conditional — `{ eyebrow && <span {...styles('eyebrow', true)}
 * {...reveal.next()}>{eyebrow}</span> }`. When `eyebrow` is falsy, there is
 * NO `<span>` in the DOM at all.
 */
export const Eyebrow: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['eyebrow'] },
	},
	render: (args) => (
		<Row>
			<Group label='eyebrow="New Arrivals"'>
				<Section { ...args as SectionContentArgs } eyebrow="New Arrivals" title="With an eyebrow" />
			</Group>
			<Group label="eyebrow: undefined">
				<Section { ...args as SectionContentArgs } eyebrow={ undefined } title="Without an eyebrow" />
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
 * `title` is optional (`title?: string`) and rendered conditionally as a
 * bare heading tag (`buildHeader`'s `<Tag {...styles('title', clsx)}
 * {...reveal.next()}>{title}</Tag>`, built only when `title` is truthy,
 * `builder.tsx`) — mirroring `eyebrow`'s own conditional,
 * see the `Eyebrow` story above. When `title` is falsy, no heading element is
 * rendered at all.
 */
export const NoTitle: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['title'] },
	},
	render: (args) => (
		<Row>
			<Group label='title="With a title"'>
				<Section { ...args as SectionContentArgs } title="With a title">
					Section with a title.
				</Section>
			</Group>
			<Group label="title: undefined">
				<Section { ...args as SectionContentArgs } title={ undefined }>
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
 * A string description plus ONE `Section.Footer` holding two `Button`s.
 * `sortContent` (`builder.tsx`) turns the string into a `<p>` description and
 * pulls the footer out as a direct child, wrapping it in the section context.
 *
 * The footer is rendered DIRECTLY as a child of `Section` via the
 * `buttonFooter()` helper (a function call returning the element). Wrapping
 * `Section.Footer` in a component of your own would hide it from `sortContent`
 * (it matches `child.type === SectionFooter`), so it would render as body
 * content outside the context provider and throw.
 */
export const ContentComposition: Story = {
	args: { title: 'Content composition', eyebrow: 'Featured' },
	render: (args) => (
		<Section { ...args as SectionContentArgs }>
			A single string child becomes one description paragraph.
			{ buttonFooter() }
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

/**
 * Only the FIRST `Section.Footer` is kept. `sortContent` (`builder.tsx`)
 * drops later footers and reports them through `verifyChildren`, which
 * `console.warn`s in non-production builds (the warning is not asserted here).
 */
export const MultipleFooters: Story = {
	args: { title: 'Multiple footers' },
	render: (args) => (
		<Section { ...args as SectionContentArgs }>
			A description.
			{ buttonFooter(['First footer']) }
			{ buttonFooter(['Second footer']) }
		</Section>
	),
	parameters: { layout: 'padded' },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		await expect(canvas.getAllByRole('button')).toHaveLength(1)
		await expect(canvas.getByRole('button', { name: 'First footer' })).toBeInTheDocument()
		await expect(canvas.queryByRole('button', { name: 'Second footer' })).not.toBeInTheDocument()
	},
}

/**
 * The footer's button size comes from the section context that `buildContent`
 * provides: `lg` when `layout` is `hero`, `md` for every other layout. It
 * reaches the footer's `Button.Group`, which sets the `--button-group-gap`
 * token for the size, so the `hero` group's gap differs from the `default`
 * group's.
 */
export const FooterSize: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['layout', 'title', 'eyebrow'] },
	},
	render: (args) => (
		<Row>
			{ (['default', 'hero'] as const).map(layout => (
				<Group key={ layout } label={ layout }>
					<Section { ...args as SectionContentArgs } layout={ layout } title={ `Footer size: ${ layout }` }>
						A description.
						{ buttonFooter() }
					</Section>
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		const gapFor = (layout: string) => {
			const root = canvas.getByRole('heading', { name: `Footer size: ${ layout }` })
				.closest(ROOT_SELECTOR) as HTMLElement
			return within(root).getByRole('group').style.getPropertyValue('--button-group-gap')
		}

		const defaultGap = gapFor('default'),
			heroGap = gapFor('hero')

		await expect(defaultGap).not.toBe('')
		await expect(heroGap).not.toBe('')
		await expect(heroGap).not.toBe(defaultGap)
	},
}

/**
 * The footer reserves a slot in the section's reveal order. `buildContent`
 * (`builder.tsx`) calls `reveal.reserve(total)` and hands the first index to
 * the footer as `revealFrom`; `Section.Footer` then stamps its non-`Button`
 * content wrapper with `data-reveal-item` via `revealItemFrom(0, revealFrom)`.
 * Slots are handed out in build order: title `0`, description paragraph `1`,
 * footer content `2`. When `animated` is `false`, `reserve` returns
 * `undefined` and `next()` returns `{}`, so NONE of them carry
 * `data-reveal-item`. The reveal timing itself is not asserted (environment
 * dependent); only these deterministic attributes are.
 */
export const FooterRevealSlot: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['animated', 'duration', 'stagger', 'title'] },
	},
	render: (args) => (
		<Row>
			<Group label="true">
				<Section
					{ ...args as AnimatedSectionArgs }
					animated
					duration={ 600 }
					stagger={ 150 }
					title="Reveal slots: true"
				>
					Reveal description true.
					<Section.Footer><span>Footer note true</span></Section.Footer>
				</Section>
			</Group>
			<Group label="false">
				<Section
					{ ...args as StaticSectionArgs }
					animated={ false }
					duration={ undefined }
					stagger={ undefined }
					title="Reveal slots: false"
				>
					Reveal description false.
					<Section.Footer><span>Footer note false</span></Section.Footer>
				</Section>
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		const slotOf = (text: string | RegExp) =>
			canvas.getByText(text).closest('[data-reveal-item]')

		await expect(slotOf('Footer note true')).toHaveAttribute('data-reveal-item', '2')
		await expect(canvas.getByRole('heading', { name: 'Reveal slots: true' })).toHaveAttribute('data-reveal-item', '0')
		await expect(canvas.getByText('Reveal description true.')).toHaveAttribute('data-reveal-item', '1')

		await expect(slotOf('Footer note false')).toBeNull()
		await expect(canvas.getByRole('heading', { name: 'Reveal slots: false' })).not.toHaveAttribute('data-reveal-item')
		await expect(canvas.getByText('Reveal description false.')).not.toHaveAttribute('data-reveal-item')
	},
}

// `children` is required at the type level but nothing stops it from being
// `null` — `Children.toArray(null)` is `[]`, so `sortContent` finds neither
// items nor a footer and only the header (eyebrow + title) renders.
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

/**
 * `duration`/`stagger` feed the inline `--reveal-duration`/`--reveal-stagger`
 * custom properties (`defineTokens`'s `tokens`) purely off their own prop
 * values — computed independently of whether `animated` is actually `true`.
 * The `false` branch passes no `duration`/`stagger` (forbidden by
 * `MaybeAnimationProps`'s `StaticComponentProps` branch), but `useProps`
 * backfills the registered defaults (`600`/`150`), so BOTH groups carry the
 * `600ms`/`150ms` tokens — the tokens do not distinguish them. `data-js-reveal` is the deterministic (non-timing-dependent)
 * half of `useReveal`'s reveal-root attributes — present whenever `isAnimated`
 * (`animated && !unstyled`), regardless of the `IntersectionObserver`'s
 * actual triggered state, which is NOT asserted here (environment-dependent,
 * framer-motion's `useInView`).
 */
export const Animated: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['animated', 'duration', 'stagger'] },
	},
	render: (args) => (
		<Row>
			<Group label="true">
				<Section
					{ ...args as AnimatedSectionArgs }
					animated
					duration={ 600 }
					stagger={ 150 }
					title="Animated: true"
				>
					Reveals on scroll.
				</Section>
			</Group>
			<Group label="false">
				<Section
					{ ...args as StaticSectionArgs }
					animated={ false }
					duration={ undefined }
					stagger={ undefined }
					title="Animated: false"
				>
					No reveal animation applied.
				</Section>
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			animatedRoot = canvas.getByRole('heading', { name: 'Animated: true' })
				.closest(ROOT_SELECTOR) as HTMLElement,
			staticRoot = canvas.getByRole('heading', { name: 'Animated: false' })
				.closest(ROOT_SELECTOR) as HTMLElement

		expect(animatedRoot.style.getPropertyValue('--reveal-duration')).toBe('600ms')
		expect(animatedRoot.style.getPropertyValue('--reveal-stagger')).toBe('150ms')

		// `tokens` keys off `duration`/`stagger` ALONE — it never reads
		// `animated`. Passing `duration={undefined}` doesn't clear them either,
		// because `useProps` backfills the registered defaults (600/150) first.
		// So the static group carries the same tokens; only `data-js-reveal`
		// below actually distinguishes the two.
		expect(staticRoot.style.getPropertyValue('--reveal-duration')).toBe('600ms')
		expect(staticRoot.style.getPropertyValue('--reveal-stagger')).toBe('150ms')

		await expect(animatedRoot).toHaveAttribute('data-js-reveal')
		await expect(staticRoot).not.toHaveAttribute('data-js-reveal')
	},
}

// `as` is NOT part of `Section`'s accepted props. Per `specs.types.ts`,
// `IsPolymorphic<S>` is true only when `S['defaults']['as']` is an
// `ElementType`; `SectionSpecs` declares `defaults: { props: ... }` with no
// `as`, so `AsPolymorphic` resolves to `{ as?: never }` and passing a tag is a
// type error, not something that gets "ignored".
//
// Note this is a DIFFERENT route to the same contract than the compound parts
// (`Grid.Item`, `Group.Item`, `Timeline.Item`, ...): those set
// `isCompound: true`, which forces `defaults.as?: never`. `Section` isn't
// compound — it simply opts out of polymorphism by declaring no default tag,
// and correspondingly hardcodes its root as `<Box as={Container}>`, whose own
// default tag is `<section>`.
//
// This story pins that fixed tag so a future refactor can't quietly change it.
export const FixedTag: Story = {
	args: { title: 'fixed tag' },
	render: (args) => <Section { ...args as SectionContentArgs } />,
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			root = canvas.getByRole('heading', { name: 'fixed tag' })
				.closest(ROOT_SELECTOR) as HTMLElement

		await expect(root.tagName).toBe('SECTION')
	},
}

/**
 * `unstyled` does NOT remove `Section`'s semantic base class (`inkq-section`)
 * — per `getClassName.tsx` the base class (`namespace ?? baseName`) is
 * emitted regardless. It also suppresses the CSS-module-hashed class SECTION'S
 * OWN `styles('root')` call would otherwise add, the config classes, and the
 * inline tokens; this story asserts only the class/hash part.
 *
 * **Real, verified behavior (re-checked against the live `Box.tsx`)**:
 * `unstyled` now ALSO reaches `Container`. `Section` never destructures
 * `unstyled` out of `rest` — neither `useReveal`'s own destructure
 * (`amount`/`animated`/`lead`/`margin`/`once`/`withinView`) nor
 * `extractOthers`'s reserved-key list names it — so it survives into
 * `others` and is spread onto `<Box as={Container} {...others}>`. `Box.tsx`
 * itself forwards its own `unstyled` prop straight through to the `as` target
 * whenever that target carries `POLYMORPHIC_MARKER` (`isPolymorphic`'s
 * `typeof target !== 'string' && POLYMORPHIC_MARKER in target`) — and
 * `Container` is built via `polymorphic()` (`createFactory` marks every
 * component it produces), so it genuinely receives `unstyled` and computes
 * its own `check.isUnstyled` from it.
 *
 * `Container`'s ROOT selector (`.inkq-container`) still never carries a
 * CSS-module hash either way — see `Container.stories.tsx`'s own `Unstyled`
 * story: `Container.module.scss`'s `.inkq-container` block has no
 * declarations of its own, only a nested `&__wrapper` rule, so CSS Modules
 * compiles no hash for the root at all, regardless of `unstyled`. But
 * `Container`'s inner wrapper `<div>` (`&__wrapper`, `styles('wrapper', true)`
 * in `Container.tsx`) DOES have its own declaration — and now that `unstyled`
 * genuinely reaches `Container`, that wrapper's hash IS suppressed on the
 * unstyled instance and present on the styled one, exactly as it is when
 * driving `Container` directly.
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
						{ ...args as SectionContentArgs }
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

		// `Container`'s wrapper div now genuinely receives `unstyled` (forwarded
		// through `Box`'s `POLYMORPHIC_MARKER` check), so its own CSS-module
		// hash is suppressed on the unstyled instance and present on the styled
		// one — detected against the real compiled `Container.module.scss`
		// export map, not a naive "any extra class" heuristic (same pattern as
		// `Container.stories.tsx`'s own `Unstyled` story).
		const hasModuleClass = (el: Element, base: string) => {
			const moduleClass = (containerClasses as Record<string, string>)[base]
			return !!moduleClass && el.classList.contains(moduleClass)
		}

		// The wrapper's SEMANTIC class takes `Section`'s namespace
		// (`inkq-section__wrapper`), not `inkq-container__wrapper` — only its
		// module hash comes from `Container.module.scss`.
		const unstyledWrapper = unstyledRoot.querySelector('.inkq-section__wrapper'),
			styledWrapper = styledRoot.querySelector('.inkq-section__wrapper')

		await expect(unstyledWrapper).toBeInTheDocument()
		await expect(styledWrapper).toBeInTheDocument()
		expect(hasModuleClass(styledWrapper!, 'inkq-container__wrapper')).toBe(true)
		expect(hasModuleClass(unstyledWrapper!, 'inkq-container__wrapper')).toBe(false)
	},
}
