import { expect, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { Section } from './Section'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import containerClasses from '../Container/Container.module.scss'
import { Button } from '@/components/core/Button'

// `layout` and `alignText` are the enums among `Section`'s own props and have
// exactly one consumer (this file), so they stay local consts rather than
// living in a shared `options.story.ts`. (`Grid`'s `gap` is also an enum, but
// it is a `Grid` prop, kept local to `Grid.stories.tsx`.)
type SectionLayout = NonNullable<Section.Props['layout']>
type SectionAlign = NonNullable<Section.Props['alignText']>

const LAYOUT_OPTIONS: readonly SectionLayout[] = [
	'default',
	'banner',
	'hero',
	'hero-split',
	'hero-tight',
	'content',
	'content-blocks',
	'content-split',
] as const

const ALIGN_OPTIONS: readonly SectionAlign[] = ['left', 'center', 'right'] as const

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
// `sortContent` (`buildSection.tsx`) only recognizes a DIRECT `Section.Footer`
// child (`child.type === SectionFooter`) and only wraps that one in the
// section context provider; a wrapper component would be treated as ordinary
// body content and the footer inside it would throw for lacking that context.
// By design the footer is always a direct child, never inside a Fragment.
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
// `content-blocks` forbids `title`/`eyebrow` entirely (`SectionBlocksProps`), so they
// come off the spread too.
type OmitKeys<T, K extends PropertyKey> = { [P in keyof T as P extends K ? never : P]: T[P] }

type SectionBlocksArgs = OmitKeys<SectionStoryProps, 'eyebrow' | 'layout' | 'title'>
type SectionContentArgs = OmitKeys<SectionStoryProps, 'layout'>

// Same treatment for `MaybeAnimationProps`'s union
// (`src/hooks/animation/constants.ts`): both groups set `animated`/`duration`/
// `stagger` explicitly, so all three come off the spread.
type AnimatedSectionArgs = OmitKeys<SectionStoryProps, 'animated' | 'duration' | 'stagger'>
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
			description: 'Rendered CONDITIONALLY by `buildHeader` in `buildSection.tsx` —`buildHeader` pushes `{ eyebrow && <span {...styles(\'eyebrow\', true)} {...reveal.next()}>{eyebrow}</span> }`. The semantic base class (`inkq-section__eyebrow`, from `nameClassBase`, always emitted) is NOT the whole story: the `true` shorthand ALSO runs `getConfigClasses`\' boolean branch (`getClassName.tsx`: `if (typeof config === \'boolean\' && config) return getBaseClass(selector, prefix)`), which computes a SEPARATE, literal, unhashed GLOBAL class — `inkq-eyebrow` (styled by `styles/_base.scss`\'s own `.inkq-eyebrow` rule), stacked alongside the semantic base class. `check.isUnstyled` is now checked FIRST in `getConfigClasses`, before that boolean branch, so `inkq-eyebrow` is suppressed entirely when `unstyled` (same mechanism as `Container`\'s `styles(\'wrapper\', true)`-driven `inkq-wrapper` — see `Container.stories.tsx`\'s `unstyled` argType description, which now behaves identically to an OBJECT config). In `hero-tight` the title comes BEFORE the eyebrow in the DOM (`header.reverse()`); see the `Layout` story. When `eyebrow` is falsy (`undefined`/`\'\'`), neither class renders at all — the `<span>` isn\'t rendered. Forbidden entirely (`never`) when `layout: \'content-blocks\'` (`SectionBlocksProps`), where `buildHeader` returns an empty header. See the `Eyebrow` story.',
		},
		layout: {
			control: 'select',
			options: LAYOUT_OPTIONS,
			description: 'Registered default is `\'default\'`. Picks the heading tag, a heading class, the content wrapper and the root modifier. Heading tag: `h1` when the layout name contains `hero` (`hero`, `hero-split`, `hero-tight`), `h2` otherwise. Heading class: `hero-split` adds `h1-display`, `hero-tight` adds `h3`, `content` adds `h4`. Wrapper (`buildSection`\'s `switch`): `hero`/`banner` wrap in a plain `<div class="inkq-section__inner">`; `hero-split` and `hero-tight` wrap in a `Grid` (4 columns when there is a footer) with the header and body in a `span 3` item and the footer meant to sit in a `span 1` slot; `content-split` wraps in a two-`Grid.Item` `Grid`; `default`, `content` and `content-blocks` render the header and content with no wrapper element at all. The root gets an `inkq-section--<layout>` modifier for every value except `\'default\'`. `content-blocks` (`SectionBlocksProps`) additionally FORBIDS `title`/`eyebrow` at the type level. See the `Layout` story.',
		},
		title: {
			control: 'text',
			description: 'Optional (`title?: string`), rendered CONDITIONALLY as a BARE tag, not a `Box` — `buildHeader` in `buildSection.tsx` builds `<Tag {...styles(\'title\', { global })} {...reveal.next()}>{title}</Tag>` when `title` is truthy, where `Tag` is `h1` when `layout` contains `hero` (`hero`, `hero-split`, `hero-tight`) and `h2` otherwise. When `title` is falsy, no heading element is rendered at all. Forbidden entirely (`never`) when `layout: \'content-blocks\'` — see `SectionBlocksProps`. See the `NoTitle` story.',
		},
		children: {
			control: false,
			description: 'Sorted by `sortContent` in `buildSection.tsx` (see the `ContentComposition` story) rather than rendered as-is: string children become a description paragraph, other valid elements are ordinary content, and a DIRECT `Section.Footer` child is pulled out and rendered after the body inside the section context. Only the FIRST `Section.Footer` is kept; extras are dropped with a `console.warn` (see the `MultipleFooters` story). Also: a `Fragment` child is wrapped in a `<p class="inkq-prose">` (it is treated like text, not ordinary content), and a number child is dropped entirely (neither a string nor a valid element). By design `Section.Footer` is always a direct child of `Section`, never inside a `Fragment` (see `FooterRevealSlot` for the direct-child form).',
		},
		alignText: {
			control: 'select',
			options: ALIGN_OPTIONS,
			description: 'Optional (`\'left\' | \'center\' | \'right\'`), no registered default. `Section` destructures it (so it never reaches the DOM as an `alignText` attribute) and emits it as the inline `--section-align` token on the root; `Section.module.scss` applies it as `text-align: var(--section-align)` on `.inkq-section__inner`. It therefore only has a visible effect for layouts that render an inner wrapper (`hero`, `hero-split`, `hero-tight`, `content-split`); `banner` centers its own inner wrapper and ignores it. The token is dropped when `unstyled`. See the `AlignText` story.',
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
 * Every `layout` value, side by side. `buildSection` (`buildSection.tsx`)
 * branches on `layout` for the heading tag (`h1` when the name contains
 * `hero`, `h2` otherwise), the heading class (`hero-split` adds `h1-display`,
 * `hero-tight` adds `h3`, `content` adds `h4`) and the content wrapper
 * (`hero`/`banner` → plain `<div>`, `content-split` → a two-`Grid.Item`
 * `Grid`, `hero-split`/`hero-tight` → a 4-column `Grid` with a `span 3`
 * content item and the footer meant to sit in a `span 1` slot,
 * `default`/`content`/`content-blocks` → no wrapper element at all).
 * `hero-tight` also renders its title BEFORE its eyebrow (`header.reverse()`).
 * Separately, the ROOT modifier class (`inkq-section--<layout>`) is toggled
 * for every value EXCEPT `'default'` (`Section.tsx`'s
 * `module = { [\`${layout}\`]: !!(layout && layout !== 'default') }`), so
 * `content-blocks` DOES get a modifier class even though it has no wrapper —
 * the two behaviors are independent.
 *
 * The `content-blocks` group mirrors `SectionBlocksProps` (`title`/`eyebrow`
 * both `never`) — no heading is rendered for it at all, unlike every other
 * layout.
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
					{ layout === 'content-blocks' ? (
						<Section { ...args as SectionBlocksArgs } layout="content-blocks">
							{ `A description for the ${ layout } layout.` }
							{ buttonFooter() }
						</Section>
					) : (
						<Section { ...args as SectionContentArgs } eyebrow={ `Eyebrow: ${ layout }` } layout={ layout } title={ `Layout: ${ layout }` }>
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
			heroTightHeading = canvas.getByRole('heading', { name: 'Layout: hero-tight' }),
			contentHeading = canvas.getByRole('heading', { name: 'Layout: content' }),
			contentSplitHeading = canvas.getByRole('heading', { name: 'Layout: content-split' })

		// `content-blocks` renders NO heading or eyebrow at all: `title`/`eyebrow`
		// are forbidden by `SectionBlocksProps`, so its root is located via its
		// description text.
		const blocksRoot = canvas.getByText('A description for the content-blocks layout.')
			.closest(ROOT_SELECTOR) as HTMLElement
		await expect(within(blocksRoot).queryByRole('heading')).not.toBeInTheDocument()
		await expect(blocksRoot.querySelector('.inkq-section__eyebrow')).not.toBeInTheDocument()

		// Layouts whose name contains `hero` render an `h1`; every other layout
		// renders an `h2`.
		await expect(heroHeading.tagName).toBe('H1')
		await expect(heroSplitHeading.tagName).toBe('H1')
		await expect(heroTightHeading.tagName).toBe('H1')
		await expect(defaultHeading.tagName).toBe('H2')
		await expect(bannerHeading.tagName).toBe('H2')
		await expect(contentHeading.tagName).toBe('H2')
		await expect(contentSplitHeading.tagName).toBe('H2')

		// `hero-split` adds the `h1-display` global class, `hero-tight` adds `h3`
		// and `content` adds `h4`; the other layouts add none of them.
		await expect(heroSplitHeading).toHaveClass('inkq-h1-display')
		await expect(heroTightHeading).toHaveClass('inkq-h3')
		await expect(contentHeading).toHaveClass('inkq-h4')
		await expect(heroHeading).not.toHaveClass('inkq-h1-display')
		await expect(heroHeading).not.toHaveClass('inkq-h3')
		await expect(defaultHeading).not.toHaveClass('inkq-h4')

		// The eyebrow comes before the title everywhere except `hero-tight`,
		// which reverses the header so the title leads.
		await expect(heroHeading.previousElementSibling).toHaveTextContent('Eyebrow: hero')
		await expect(heroTightHeading.previousElementSibling).toBeNull()
		await expect(heroTightHeading.nextElementSibling).toHaveTextContent('Eyebrow: hero-tight')

		const defaultRoot = defaultHeading.closest(ROOT_SELECTOR) as HTMLElement,
			bannerRoot = bannerHeading.closest(ROOT_SELECTOR) as HTMLElement,
			heroRoot = heroHeading.closest(ROOT_SELECTOR) as HTMLElement,
			heroSplitRoot = heroSplitHeading.closest(ROOT_SELECTOR) as HTMLElement,
			heroTightRoot = heroTightHeading.closest(ROOT_SELECTOR) as HTMLElement,
				contentRoot = contentHeading.closest(ROOT_SELECTOR) as HTMLElement,
				contentSplitRoot = contentSplitHeading.closest(ROOT_SELECTOR) as HTMLElement

		// `formatConfigClass`/`getStyleClass` (`getClassName.tsx`) substitute the
		// CSS-module HASH for a `module` modifier when a matching rule exists in
		// the stylesheet (unlike the always-present-alongside-its-hash root/selector
		// base classes) — since `Section.module.scss` defines real `--banner`/
		// `--hero`/`--hero-split`/`--hero-tight`/`--content`/`--content-blocks`/
		// `--content-split` rules, the literal
		// `inkq-section--<layout>` token never appears verbatim in the DOM; only
		// its hash (e.g. `_inkq-section--banner_nmvr1_34`) does. Module-generated hashes preserve
		// the original name as a substring, so assert via `className` substring
		// matching rather than `toHaveClass`'s exact-token match.
		await expect(defaultRoot.className).not.toMatch('inkq-section--')
		await expect(blocksRoot.className).toMatch('inkq-section--content-blocks')
		await expect(bannerRoot.className).toMatch('inkq-section--banner')
		await expect(heroRoot.className).toMatch('inkq-section--hero')
		await expect(heroSplitRoot.className).toMatch('inkq-section--hero-split')
		await expect(heroTightRoot.className).toMatch('inkq-section--hero-tight')
		await expect(contentRoot.className).toMatch('inkq-section--content')
		await expect(contentSplitRoot.className).toMatch('inkq-section--content-split')

		// `hero`/`banner` wrap the header + content in a plain `.inkq-section__inner`
		// div. Queried by walking up from the heading itself, not via a selector
		// chain through `Container`'s own internal wrapper — `Container`'s
		// `styles('wrapper')` call inherits and mangles its computed class name
		// once rendered via `Section`'s `<Box as={Container}>` (see the
		// `styles(child)`-inheritance note above `ROOT_SELECTOR`), so its exact
		// className isn't a stable thing to assert against here.
		await expect(heroHeading.closest('.inkq-section__inner')).toBeInTheDocument()
		await expect(bannerHeading.closest('.inkq-section__inner')).toBeInTheDocument()

		// `default`, `content` and `content-blocks` all fall through to
		// `buildSection`'s `default:` branch: no wrapper element at all around
		// the header/content.
		await expect(defaultHeading.closest('.inkq-section__inner')).not.toBeInTheDocument()
		await expect(contentHeading.closest('.inkq-section__inner')).not.toBeInTheDocument()
		await expect(blocksRoot.querySelector('.inkq-section__inner')).not.toBeInTheDocument()

		// `content-split` wraps the header and content in two separate `Grid.Item`s.
		await expect(contentSplitRoot.querySelectorAll('.inkq-grid-item')).toHaveLength(2)

		// `hero-split` and `hero-tight` are 4-column `Grid`s (`equalWidth` is on
		// by default, hence `repeat(4, ...)`): the header/body item spans 3
		// columns and the footer item should span 1. Located via the inline
		// `--grid-span-col` token, since `Section` hands those items its own
		// `content` class.
		//
		// The footer `span 1` check currently fails: `SectionFooter` only honors
		// the context's `as`/`span` when `isValidElement(as)`, which is false for
		// the `Grid.Item` component, so the footer renders as a plain `div`.
		for (const [heading, root] of [
			[heroSplitHeading, heroSplitRoot],
			[heroTightHeading, heroTightRoot],
		] as const) {
			const grid = heading.closest('.inkq-section__inner') as HTMLElement,
				contentItem = heading.closest('[style*="--grid-span-col"]') as HTMLElement | null,
				ctaItem = within(root).getByRole('group').closest('[style*="--grid-span-col"]') as HTMLElement | null

			await expect(grid.style.getPropertyValue('--grid-cols')).toBe('repeat(4, minmax(0, 1fr))')
			await expect(contentItem?.style.getPropertyValue('--grid-span-col')).toBe('span 3')
			await expect(ctaItem?.style.getPropertyValue('--grid-span-col')).toBe('span 1')
			await expect(contentItem).not.toBe(ctaItem)
		}

		// The footer's `Button.Group` renders identically regardless of `layout`.
		for (const root of [
			defaultRoot, blocksRoot, bannerRoot, heroRoot,
			heroSplitRoot, heroTightRoot, contentRoot, contentSplitRoot,
		]) {
			await expect(within(root).getByRole('group')).toBeInTheDocument()
			await expect(within(root).getAllByRole('button')).toHaveLength(2)
		}
	},
}

/**
 * `eyebrow` is conditional (`buildHeader` in `buildSection.tsx`) — `{ eyebrow && <span {...styles('eyebrow', true)}
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
 * `buildSection.tsx`) — mirroring `eyebrow`'s own conditional,
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
 * `sortContent` (`buildSection.tsx`) turns the string into a `<p>` description and
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
 * Only the FIRST `Section.Footer` is kept. `sortContent` (`buildSection.tsx`)
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
 * (`buildSection.tsx`) calls `reveal.reserve(total)` and hands the first index to
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

/**
 * `alignText` side by side with the unset case. `Section` emits it as the
 * inline `--section-align` token on the root, and `Section.module.scss`
 * applies it as `text-align` on `.inkq-section__inner`. Only layouts that
 * render an inner wrapper show the effect, so these use `hero`. The prop is
 * consumed by `Section` and never reaches the DOM as an `alignText` attribute.
 */
export const AlignText: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['alignText', 'layout', 'title'] },
	},
	render: (args) => (
		<Row>
			<Group label="undefined">
				<Section
					{ ...args as SectionContentArgs }
					alignText={ undefined }
					layout="hero"
					title="Align: undefined"
				>
					Aligned description.
				</Section>
			</Group>
			{ ALIGN_OPTIONS.map(alignText => (
				<Group key={ alignText } label={ alignText }>
					<Section
						{ ...args as SectionContentArgs }
						alignText={ alignText }
						layout="hero"
						title={ `Align: ${ alignText }` }
					>
						Aligned description.
					</Section>
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			rootFor = (value: string) => canvas.getByRole('heading', { name: `Align: ${ value }` })
				.closest(ROOT_SELECTOR) as HTMLElement

		const unsetRoot = rootFor('undefined')

		await expect(unsetRoot.style.getPropertyValue('--section-align')).toBe('')
		await expect(unsetRoot).not.toHaveAttribute('aligntext')

		for (const alignText of ALIGN_OPTIONS) {
			const root = rootFor(alignText),
				inner = root.querySelector('.inkq-section__inner') as HTMLElement

			await expect(root.style.getPropertyValue('--section-align')).toBe(alignText)
			await expect(getComputedStyle(inner).textAlign).toBe(alignText)
			await expect(root).not.toHaveAttribute('aligntext')
		}
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
