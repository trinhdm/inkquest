import { expect, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { Footer } from './Footer'
import { FOOTER_GLOBAL_NAV, SOCIALS_NAV } from '@/utils/navigation'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import moduleClasses from './Footer.module.scss'

const BOOLEAN_OPTIONS = [true, false] as const

const Row = ({ children }: { children: ReactNode }) => (
	<div style={ { display: 'flex', flexDirection: 'column', gap: 32 } }>
		{ children }
	</div>
)

const Group = ({ label, children }: { label: string, children: ReactNode }) => (
	<div style={ { display: 'flex', flexDirection: 'column', gap: 8, width: '100%' } }>
		<span style={ { font: 'var(--inkq-text-control)', letterSpacing: '.15em', textTransform: 'uppercase', opacity: 0.6 } }>
			{ label }
		</span>
		{ children }
	</div>
)

// `Footer`'s root class has its own SCSS declaration (`.inkq-footer { background-color:
// ...; position: relative; ... }`), so this literal, always-present class name is a
// stable selector for reaching the root element regardless of state.
const ROOT_SELECTOR = '.inkq-footer'

// Real `SOCIAL_BRANDS` coverage: `Icon.tsx`'s `getBrandProps` only has a case for
// `'instagram' | 'tiktok' | 'x'` — `'facebook'`/`'pinterest'` fall through its
// `default: return` branch, `configSocialIcon` then returns `undefined`, and
// `buildIcon` returns `null` for those two types. So even though `SOCIALS_NAV` (from
// `@/utils/navigation`) lists all 5 `SOCIAL_BRANDS`, only 3 of them ever render a
// visible icon — this is true both when `socials` explicitly lists them AND when the
// fallback-to-ALL branch kicks in (see the `Socials` story).
const RENDERABLE_SOCIAL_COUNT = 3

// A small custom `items` fixture, independent of `FOOTER_GLOBAL_NAV`, used to
// demonstrate the `location: 'legal'` vs. info partition deterministically:
// `About`/`Careers` are real leaf children of the `Company` `NavigationItem` (no
// `route` of their own on `Company`), and `Privacy`/`Terms` are real leaf children of
// `Legal` — `filterNavigation`'s non-`dropdown` layout flattens both parents into
// their matched children directly.
const CUSTOM_ITEMS: NonNullable<Footer.Props['items']> = [
	{ category: 'Company', routes: ['/about', '/careers'] },
	{ routes: ['/privacy-policy', '/terms-conditions'], location: 'legal' },
]

// `Footer.Props` (the `declare namespace` export) is just the raw `FooterProps`
// interface — it doesn't include `as`/`unstyled`/`attributes`/etc., which only exist
// on the actual accepted prop type, `PolymorphicProps<FooterProps, C>`.
// `Parameters<typeof Footer>[0]` reads that real, wrapped type straight off the
// component itself — the generic call signature's default `C` resolves to `'footer'`
// here, since `FooterSpecs`'s `defaults.as` is `'footer'` (`Footer.tsx`'s local `TAG`
// constant), matching `const DEFAULT_PROPS = { as: TAG, items: FOOTER_GLOBAL_NAV,
// socials: ['instagram', 'tiktok', 'x'] }` and `Footer.setDefaults({ props:
// DEFAULT_PROPS })`.
type FooterStoryProps = Parameters<typeof Footer>[0]
type Story = StoryObj<FooterStoryProps>

const meta: Meta<FooterStoryProps> = {
	component: Footer,
	title: 'Navigation/Footer',
	// Full-bleed section: centering it in the canvas misrepresents the layout, so
	// every story overrides the global `layout: 'centered'` default.
	parameters: { layout: 'padded' },
	argTypes: {
		items: {
			control: 'object',
			description: 'A `readonly FooterArea.Props[\'items\']` list (defaults to `FOOTER_GLOBAL_NAV`). `Footer.tsx` partitions this ONE list into two groups purely by `item.location === \'legal\'` — everything else (including items with no `location` at all) is treated as "info" and rendered in the top section; `location: \'legal\'` items render in the bottom section. See the `ItemsPartition` and `EmptyItems` stories.',
		},
		socials: {
			control: 'object',
			description: 'A `readonly SocialBrand[]` allow-list (defaults to `[\'instagram\', \'tiktok\', \'x\']`). Filters `SOCIALS_NAV` down to the matching entries. IMPORTANT quirk: `!socials?.length` — so an explicit empty array OR `undefined` both fall back to rendering ALL of `SOCIALS_NAV`, not none. See the `Socials` story, including the further quirk that only 3 of the 5 `SOCIAL_BRANDS` ever render a visible icon regardless.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Part of `PolymorphicProps` (via the shared `SpecsContract`), not `Footer`\'s own `FooterProps`. Only affects `Footer`\'s OWN `styles(...)` calls (root/info/legal/tagline) — `Footer.tsx` never forwards `unstyled` down to the nested `<FooterArea>`, so everything `FooterArea` itself renders (its wrapper, content, navigation, per-group `Menu`) is unaffected by this prop. See the `Unstyled` story.',
		},
	},
	args: {
		...getDefaultProps<Footer.Props>('Footer'),
	},
}

export default meta

/**
 * Default `items` (`FOOTER_GLOBAL_NAV`) and `socials`
 * (`['instagram', 'tiktok', 'x']`). Renders `Logo`, a tagline, 3 social icons, one
 * `<Menu>` per `items` entry (5 total: 4 info categories + 1 legal group), and a
 * copyright line with the current year and `COMPANY_NAME`.
 */
export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		// Scoped to `.inkq-footer__socials`, NOT `canvas` as a whole — `Logo`
		// (`next/image`) also renders an `<img>` with a non-empty `alt`, which
		// otherwise inflates a canvas-wide `getAllByRole('img')` count by one.
		const socials = within(canvasElement.querySelector('.inkq-footer__socials') as HTMLElement)
		await expect(socials.getAllByRole('img')).toHaveLength(RENDERABLE_SOCIAL_COUNT)
		await expect(canvas.getByText('Find your artist. Own the ink.')).toBeInTheDocument()

		// One `<Menu role="menubar">` per `FOOTER_GLOBAL_NAV` entry.
		await expect(canvas.getAllByRole('menubar')).toHaveLength(FOOTER_GLOBAL_NAV.length)

		const currentYear = new Date().getFullYear()
		await expect(canvas.getByText(`© ${ currentYear } Inkquest`)).toBeInTheDocument()
	},
}

/**
 * `Footer.tsx` partitions `items` purely by `item.location === 'legal'` — this
 * fixture uses one plain info group (`Company`, no `location`) and one explicit
 * `location: 'legal'` group, to show the split deterministically: the info group's
 * category label renders, the legal group (no `category`) renders no label, and each
 * lands in its own section (`.inkq-footer__info` / `.inkq-footer__legal`).
 */
export const ItemsPartition: Story = {
	args: { items: CUSTOM_ITEMS },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		const info = canvasElement.querySelector('.inkq-footer__info') as HTMLElement,
			legal = canvasElement.querySelector('.inkq-footer__legal') as HTMLElement

		await expect(within(info).getByText('Company')).toBeInTheDocument()
		await expect(within(info).getByRole('menuitem', { name: 'About' })).toBeInTheDocument()
		await expect(within(info).getByRole('menuitem', { name: 'Careers' })).toBeInTheDocument()

		// The legal group has no `category`, so no label span renders for it —
		// only its `<Menu>` items are present.
		await expect(within(legal).queryByText('Legal')).not.toBeInTheDocument()
		await expect(within(legal).getByRole('menuitem', { name: 'Privacy' })).toBeInTheDocument()
		await expect(within(legal).getByRole('menuitem', { name: 'Terms' })).toBeInTheDocument()

		await expect(canvas.getAllByRole('menubar')).toHaveLength(2)
	},
}

/**
 * Edge case: `items: []`. The `for...of` partition loop never runs, so both
 * `infoItems`/`legalItems` stay empty and NEITHER `<FooterArea>`'s `<Menu>` renders
 * (`FooterArea` itself still mounts — it's the nested navigation `<div>`, guarded by
 * `!!items.length`, that's skipped). `Logo`, the tagline, socials, and the copyright
 * line are all hardcoded `FooterArea` children, so they're unaffected and still render.
 */
export const EmptyItems: Story = {
	args: { items: [] },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		await expect(canvas.queryAllByRole('menubar')).toHaveLength(0)
		await expect(canvas.getByText('Find your artist. Own the ink.')).toBeInTheDocument()

		const socials = within(canvasElement.querySelector('.inkq-footer__socials') as HTMLElement)
		await expect(socials.getAllByRole('img')).toHaveLength(RENDERABLE_SOCIAL_COUNT)
	},
}

/**
 * `socials` filters `SOCIALS_NAV` down to the matching entries — but `!socials?.length`
 * means an empty array OR `undefined` both fall back to ALL of `SOCIALS_NAV`, not none.
 * Regardless of how many types are listed, only `instagram`/`tiktok`/`x` ever produce a
 * visible icon (`Icon.tsx`'s `getBrandProps` has no case for `facebook`/`pinterest`, so
 * those two silently render nothing) — which is why the default (3 explicit types) and
 * both fallback-to-ALL groups all show the same 3 icons.
 */
export const Socials: Story = {
	parameters: { controls: { exclude: ['socials'] } },
	render: (args) => (
		<Row>
			<Group label='["instagram", "tiktok", "x"] (default)'>
				<Footer { ...args } />
			</Group>
			<Group label='["instagram", "x"] (custom subset)'>
				<Footer { ...args } socials={ ['instagram', 'x'] } />
			</Group>
			<Group label='[] (falsy length -> falls back to ALL of SOCIALS_NAV)'>
				<Footer { ...args } socials={ [] } />
			</Group>
			<Group label='undefined (falls back to ALL of SOCIALS_NAV)'>
				<Footer { ...args } socials={ undefined } />
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const roots = Array.from(canvasElement.querySelectorAll(ROOT_SELECTOR)) as HTMLElement[]
		await expect(roots).toHaveLength(4)

		// Scoped to each root's OWN `.inkq-footer__socials`, NOT the whole root —
		// each `Footer` also renders its own `Logo` (`next/image`) `<img>`, which
		// otherwise inflates a root-wide `getAllByRole('img')` count by one.
		const socialsOf = (root: HTMLElement) =>
			within(root.querySelector('.inkq-footer__socials') as HTMLElement)

		const [defaultRoot, customRoot, emptyRoot, undefinedRoot] = roots

		await expect(socialsOf(defaultRoot).getAllByRole('img')).toHaveLength(RENDERABLE_SOCIAL_COUNT)
		await expect(socialsOf(customRoot).getAllByRole('img')).toHaveLength(2)
		// Fallback to ALL of `SOCIALS_NAV` (5 brands), but only 3 render visibly.
		await expect(socialsOf(emptyRoot).getAllByRole('img')).toHaveLength(RENDERABLE_SOCIAL_COUNT)
		await expect(socialsOf(undefinedRoot).getAllByRole('img')).toHaveLength(RENDERABLE_SOCIAL_COUNT)
		await expect(SOCIALS_NAV.length).toBeGreaterThan(RENDERABLE_SOCIAL_COUNT)
	},
}

export const AsElement: Story = {
	render: (args) => (
		<Row>
			<Group label='as="footer" (default)'>
				<Footer { ...args } />
			</Group>
			<Group label='as="div"'>
				<Footer { ...args } as="div" />
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const roots = canvasElement.querySelectorAll(ROOT_SELECTOR)

		await expect(roots).toHaveLength(2)

		const [asFooter, asDiv] = Array.from(roots) as HTMLElement[]

		await expect(asFooter.tagName).toBe('FOOTER')
		await expect(asDiv.tagName).toBe('DIV')
	},
}

/**
 * `unstyled` never removes the semantic base classes (`inkq-footer`,
 * `inkq-footer__info`, `inkq-footer__legal`, `inkq-footer__wrapper`) — only the
 * CSS-module hash normally appended alongside a plain (config-less) `styles(selector)`
 * call is suppressed (`inkq-footer`, `inkq-footer__info`, `inkq-footer__legal` all have
 * direct SCSS declarations).
 *
 * The wrapper's `inkq-wrapper` class survives regardless of `unstyled`, for TWO
 * independent reasons, both verified against the live source:
 *  - `FooterArea`'s `styles('wrapper', true)` call is the BOOLEAN-shorthand form —
 *    `getConfigClasses` in `getClassName.tsx` checks `typeof config === 'boolean'`
 *    FIRST, before it ever looks at `check.isUnstyled`, so a boolean-shorthand class
 *    is emitted unconditionally, `unstyled` or not (unlike an OBJECT config —
 *    `{ module: {...} }` / `{ global: {...} }` — which IS fully suppressed when
 *    unstyled; see `Menu.tsx`'s own `orientation` module class for that case).
 *  - Independently, `Footer.tsx` renders `<FooterArea items={ infoItems }>` (and the
 *    legal one) WITHOUT ever forwarding its own `unstyled` prop down at all — so
 *    `FooterArea`'s internal `check.isUnstyled` is always `false` regardless of the
 *    outer `<Footer unstyled>`, meaning even `FooterArea`'s CSS-module HASH for
 *    `inkq-footer__wrapper` (which normally WOULD be suppressed under real
 *    `unstyled`) survives here too, in BOTH rows below.
 *
 * `Footer`'s own `unstyled` only ever affects `Footer`'s OWN `styles(...)` calls
 * (root/info/legal/tagline), never anything rendered by the nested `FooterArea`.
 *
 * `Footer`'s own `styles('tagline')` call has no matching SCSS selector at all
 * (`Footer.module.scss` declares no `&__tagline` rule) — so `inkq-footer__tagline` is
 * a permanently unhashed literal class, unaffected by `unstyled` either way.
 */
export const Unstyled: Story = {
	parameters: { controls: { exclude: ['unstyled'] } },
	render: (args) => (
		<Row>
			{ BOOLEAN_OPTIONS.map(unstyled => (
				<Group key={ String(unstyled) } label={ String(unstyled) }>
					<Footer { ...args } unstyled={ unstyled } />
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const roots = canvasElement.querySelectorAll(ROOT_SELECTOR)

		await expect(roots).toHaveLength(2)

		const [unstyledRoot, styledRoot] = Array.from(roots) as HTMLElement[]

		const hasModuleClass = (el: Element, base: string) => {
			const moduleClass = (moduleClasses as Record<string, string>)[base]
			return !!moduleClass && el.classList.contains(moduleClass)
		}

		await expect(styledRoot).toHaveClass('inkq-footer')
		await expect(unstyledRoot).toHaveClass('inkq-footer')
		expect(hasModuleClass(styledRoot, 'inkq-footer')).toBe(true)
		expect(hasModuleClass(unstyledRoot, 'inkq-footer')).toBe(false)

		const styledInfo = styledRoot.querySelector('.inkq-footer__info') as HTMLElement,
			unstyledInfo = unstyledRoot.querySelector('.inkq-footer__info') as HTMLElement

		await expect(styledInfo).toHaveClass('inkq-footer__info')
		await expect(unstyledInfo).toHaveClass('inkq-footer__info')
		expect(hasModuleClass(styledInfo, 'inkq-footer__info')).toBe(true)
		expect(hasModuleClass(unstyledInfo, 'inkq-footer__info')).toBe(false)

		// `FooterArea` never receives `Footer`'s own `unstyled` prop (`Footer.tsx`
		// renders `<FooterArea items={...}>` with no `unstyled` forwarded at all), so
		// the wrapper is ALWAYS styled — hash and `inkq-wrapper` both present — in
		// BOTH rows, regardless of the outer `Footer`'s own `unstyled` value.
		const styledWrapper = styledInfo.querySelector('.inkq-footer__wrapper') as HTMLElement,
			unstyledWrapper = unstyledInfo.querySelector('.inkq-footer__wrapper') as HTMLElement

		await expect(styledWrapper).toHaveClass('inkq-footer__wrapper', 'inkq-wrapper')
		await expect(unstyledWrapper).toHaveClass('inkq-footer__wrapper', 'inkq-wrapper')
		expect(hasModuleClass(styledWrapper, 'inkq-footer__wrapper')).toBe(true)
		expect(hasModuleClass(unstyledWrapper, 'inkq-footer__wrapper')).toBe(true)

		const styledTagline = styledRoot.querySelector('.inkq-footer__tagline') as HTMLElement,
			unstyledTagline = unstyledRoot.querySelector('.inkq-footer__tagline') as HTMLElement

		await expect(styledTagline).toHaveClass('inkq-footer__tagline')
		await expect(unstyledTagline).toHaveClass('inkq-footer__tagline')
		expect(hasModuleClass(styledTagline, 'inkq-footer__tagline')).toBe(false)
		expect(hasModuleClass(unstyledTagline, 'inkq-footer__tagline')).toBe(false)
	},
}
