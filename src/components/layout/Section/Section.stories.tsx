import { expect, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { Section } from './Section'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import containerClasses from '../Container/Container.module.scss'

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
			description: '**Re-verified against the live `Section.tsx`/`builder.tsx`**: rendered CONDITIONALLY — `buildHeader` pushes `{ eyebrow && <span {...styles(\'eyebrow\', true)} {...reveal.next()}>{eyebrow}</span> }`. The `true` shorthand (`SelectorConfigScope`\'s boolean branch, per `getConfigClasses` in `getClassName.tsx`) just emits the selector\'s own base class (`inkq-section__eyebrow`) with no extra module/global/selector modifier classes layered on. When `eyebrow` is falsy (`undefined`/`\'\'`), the `<span>` isn\'t rendered at all. Forbidden entirely (`never`) when `layout: \'blocks\'` — see `SectionBlocksProps`. See the `Eyebrow` story.',
		},
		layout: {
			control: 'select',
			options: LAYOUT_OPTIONS,
			description: 'Changes the heading tag (`h1` for `hero`, `h2` otherwise) and the content wrapper: `hero`/`cta` wrap in a plain `<div class="inkq-section__inner">`, `split` wraps in a two-`Grid.Item` `Grid`, and `default`/`blocks` render the header/content with no wrapper element at all (`blocks` falls through `buildSection`\'s `switch` to the same `default:` branch as `\'default\'`). Also toggles the `inkq-section--<layout>` modifier class for every value except `\'default\'` (`blocks` included — see `Section.module.scss`\'s `&--blocks { padding-block: 0; }` rule). `layout: \'blocks\'` (`SectionBlocksProps`) additionally FORBIDS `title`/`eyebrow` at the type level — see the `Layout` story\'s `blocks` group.',
		},
		title: {
			control: 'text',
			description: '**Re-verified against the live `builder.tsx`**: optional (`title?: string`), rendered CONDITIONALLY as a BARE tag, not a `Box` — `buildHeader` pushes `{ title && <Tag {...styles(\'title\')}>{title}</Tag> }` where `Tag` is `\'h1\'`/`\'h2\'` depending on `layout`. When `title` is falsy, no heading element is rendered at all. Forbidden entirely (`never`) when `layout: \'blocks\'` — see `SectionBlocksProps`. See the `NoTitle` story.',
		},
		children: {
			control: false,
			description: 'Passed through `orderSection` (see the `ContentComposition` story) rather than rendered as-is: string children become a description paragraph, and any `isValidElement` child whose `type !== Button` is treated as ordinary content while a genuine `Section.Button` (up to 2) becomes a CTA `Button.Group` entry.',
		},
		animated: {
			control: 'boolean',
			description: 'Discriminates `MaybeAnimationProps`: `animated: true` REQUIRES `duration` (registered default `600`; also allows `stagger`/`amount`/`once`/`lead`/`margin`); leaving `animated` unset means `duration`/`stagger`/etc. must also be unset. Drives `useReveal`\'s `isAnimated` gate (`animated && !unstyled`), which controls whether the deterministic `data-js-reveal` root attribute (and per-item `data-reveal-item` attributes) are applied at all. See the `Animated` story.',
		},
		duration: {
			control: 'number',
			description: 'Only valid alongside `animated: true`. Feeds the inline `--reveal-duration` CSS custom property (`setThemeCSS`\'s `tokens`, formatted `${duration}ms`) — computed purely off `props.duration`, independent of whether `animated` is actually `true`. Registered default is `600`. See the `Animated` story.',
		},
		stagger: {
			control: 'number',
			description: 'Only valid alongside `animated: true`. Feeds the inline `--reveal-stagger` CSS custom property the same way `duration` feeds `--reveal-duration` — computed purely off `props.stagger`, independent of `animated`. Registered default is `150`. See the `Animated` story.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Part of `PolymorphicProps` (via the shared `SpecsContract`), not `Section`\'s own `SectionProps`. The semantic base class (`inkq-section`) is ALWAYS emitted regardless of this prop — `unstyled` only suppresses the CSS-module-hashed class normally appended alongside it. It also flows on through to `Container` itself: `Section` never destructures `unstyled` out of `rest`, so it survives into `others` and reaches `<Box as={Container} {...others}>`, and `Box.tsx` forwards its own `unstyled` prop to the `as` target whenever that target carries `POLYMORPHIC_MARKER` — which `Container` does, being built via `polymorphic()`. See the `Unstyled` story for the resulting effect on `Container`\'s own wrapper hash.',
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
 * All five `layout` values, side by side. `buildSection` (`Section.tsx`'s
 * `switch (layout)`) branches on `layout` for exactly two things: the heading
 * tag (`h1` for `hero`, `h2` for everything else) and the content wrapper
 * (`hero`/`cta` → plain `<div>`, `split` → a two-`Grid.Item` `Grid`,
 * `default`/`blocks` → no wrapper element at all, just the header/content
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
							<Section.Button>Learn more</Section.Button>
							<Section.Button>View more</Section.Button>
						</Section>
					) : (
						<Section { ...args as SectionContentArgs } layout={ layout } title={ `Layout: ${ layout }` }>
							{ `A description for the ${ layout } layout.` }
							<Section.Button>Learn more</Section.Button>
							<Section.Button>View more</Section.Button>
						</Section>
					) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		const defaultHeading = canvas.getByRole('heading', { name: 'Layout: default' }),
			ctaHeading = canvas.getByRole('heading', { name: 'Layout: cta' }),
			heroHeading = canvas.getByRole('heading', { name: 'Layout: hero' }),
			splitHeading = canvas.getByRole('heading', { name: 'Layout: split' })

		// `blocks` renders NO heading at all — `title`/`eyebrow` are forbidden by
		// `SectionBlocksProps`, so its root is located via its description text.
		const blocksRoot = canvas.getByText('A description for the blocks layout.')
			.closest(ROOT_SELECTOR) as HTMLElement
		await expect(within(blocksRoot).queryByRole('heading')).not.toBeInTheDocument()

		// Only `hero` renders an `h1`; every other layout renders an `h2`.
		await expect(heroHeading.tagName).toBe('H1')
		await expect(defaultHeading.tagName).toBe('H2')
		await expect(ctaHeading.tagName).toBe('H2')
		await expect(splitHeading.tagName).toBe('H2')

		const defaultRoot = defaultHeading.closest(ROOT_SELECTOR) as HTMLElement,
			ctaRoot = ctaHeading.closest(ROOT_SELECTOR) as HTMLElement,
			heroRoot = heroHeading.closest(ROOT_SELECTOR) as HTMLElement,
			splitRoot = splitHeading.closest(ROOT_SELECTOR) as HTMLElement

		// `formatConfigClass`/`getStyleClass` (`getClassName.tsx`) substitute the
		// CSS-module HASH for a `module` modifier when a matching rule exists in
		// the stylesheet (unlike the always-present-alongside-its-hash root/selector
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
		await expect(blocksRoot.querySelector('.inkq-section__inner')).not.toBeInTheDocument()

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
 * bare heading tag (`buildHeader`'s `{ title && <Tag {...styles('title')}>
 * {title}</Tag> }`, `builder.tsx`) — mirroring `eyebrow`'s own conditional,
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
	args: { title: 'Content composition', eyebrow: 'Featured' },
	render: (args) => (
		<Section { ...args as SectionContentArgs }>
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

/**
 * `duration`/`stagger` feed the inline `--reveal-duration`/`--reveal-stagger`
 * custom properties (`setThemeCSS`'s `tokens`) purely off their own prop
 * values — computed independently of whether `animated` is actually `true`.
 * The `false` branch never passes `duration`/`stagger` at all (forbidden by
 * `MaybeAnimationProps`'s `StaticComponentProps` branch), so both tokens are
 * absent there. `data-js-reveal` is the deterministic (non-timing-dependent)
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
 * — per `getClassName.tsx` the base class is now ALWAYS emitted. It only
 * suppresses the CSS-module-hashed class SECTION'S OWN `styles('root')` call
 * would otherwise add.
 *
 * **Real, verified behavior (re-checked against the live `Box.tsx`)**:
 * `unstyled` now ALSO reaches `Container`. `Section` never destructures
 * `unstyled` out of `rest` — neither `useReveal`'s own destructure
 * (`amount`/`animated`/`lead`/`margin`/`once`/`withinView`) nor
 * `extractOtherProps`'s reserved-key list names it — so it survives into
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
