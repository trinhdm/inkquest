import { expect, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { Header } from './Header'
import { NavRoutes } from '@/utils/navigation'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import moduleClasses from './Header.module.scss'

const Row = ({ children }: { children: ReactNode }) => (
	<div style={ { display: 'flex', flexDirection: 'column', gap: 32 } }>
		{ children }
	</div>
)

const Group = ({ label, children }: { label: string, children: ReactNode }) => (
	<div style={ { display: 'flex', flexDirection: 'column', gap: 8 } }>
		<span style={ { font: 'var(--inkq-text-control)', letterSpacing: '.15em', textTransform: 'uppercase', opacity: 0.6 } }>
			{ label }
		</span>
		<div>{ children }</div>
	</div>
)

// `Header`'s root class has its own SCSS declaration (`.inkq-header { position:
// relative; }`), so this literal, always-present class name is a stable selector for
// reaching the root element regardless of state.
const ROOT_SELECTOR = '.inkq-header'

// `HEADER_GLOBAL_NAV` (the registered `navbar` default) includes `/community`, so
// `Community` itself renders as one of `Navbar`'s own top-level leaf links — the SAME
// text as `Subnav`'s own derived label. Scoped to `Subnav`'s own label class (per
// `Subnav.stories.tsx`'s own `LABEL_SELECTOR` convention) to disambiguate the two.
const SUBNAV_LABEL_SELECTOR = '.inkq-subnav__label'

// The app shell's real `Subnav` configuration for `/community` (matches
// `Subnav.stories.tsx`'s own fixture) — used here to demonstrate `Header`'s explicit
// `subnav` prop, as distinct from its `usePathname`-driven fallback (see
// `PathnameFallback`).
const COMMUNITY_ROUTES = [
	NavRoutes.COMMUNITY,
	NavRoutes.COMMUNITY_FEED,
	NavRoutes.COMMUNITY_EVENTS,
	NavRoutes.COMMUNITY_SPOTLIGHTS,
]

// `Header.Props` (the `declare namespace` export) is just the raw `HeaderProps`
// interface — it doesn't include `as`/`unstyled`/`attributes`/etc., which only exist
// on the actual accepted prop type, `PolymorphicProps<HeaderProps, C>`.
// `Parameters<typeof Header>[0]` reads that real, wrapped type straight off the
// component itself — the generic call signature's default `C` resolves to `'header'`
// here, since `HeaderSpecs`'s `defaults.as` is `'header'` (`Header.tsx`'s local `TAG`
// constant).
type HeaderStoryProps = Parameters<typeof Header>[0]
type Story = StoryObj<HeaderStoryProps>

const meta: Meta<HeaderStoryProps> = {
	component: Header,
	title: 'Navigation/Header',
	// Full-bleed section: centering it in the canvas misrepresents the layout, so
	// every story overrides the global `layout: 'centered'` default. `Header.tsx` calls
	// `usePathname()` (`next/navigation`) unconditionally — `@storybook/nextjs-vite`
	// only provides the App Router context (`PathnameContext`, etc.) that hook reads
	// from when `parameters.nextjs.appDirectory` is truthy, so every story in this file
	// sets it at the meta level; individual stories override `nextjs.navigation.pathname`
	// as needed.
	parameters: {
		layout: 'padded',
		nextjs: {
			appDirectory: true,
			navigation: { pathname: '/community' },
		},
	},
	argTypes: {
		navbar: {
			control: 'object',
			description: 'Forwarded straight through as `<Navbar routes={ navbar?.routes } />`. Defaults to `{ routes: HEADER_GLOBAL_NAV }`.',
		},
		subnav: {
			control: 'object',
			description: 'When `subnav?.routes?.length` is falsy, `Header` computes its OWN routes via `listRoutesWithSlug(pathname)` (the current `usePathname()` value) instead — see the `PathnameFallback` story. `subnav?.category` is always forwarded as-is regardless of which routes were used.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Part of `PolymorphicProps` (via the shared `SpecsContract`), not `Header`\'s own `HeaderProps`. The semantic base class (`inkq-header`) is ALWAYS emitted — `Header.module.scss` declares only the root selector (`position: relative`, no nested rules), so `unstyled` only suppresses that one CSS-module hash. See the `Unstyled` story.',
		},
	},
	args: {
		...getDefaultProps<Header.Props>('Header'),
		subnav: { category: 'Community', routes: COMMUNITY_ROUTES },
	},
}

export default meta

/**
 * Explicit `navbar`/`subnav` routes (the registered `navbar` default,
 * `{ routes: HEADER_GLOBAL_NAV }`, plus an explicit `subnav`) — bypasses the
 * `usePathname`-driven fallback entirely, since `subnav.routes` is non-empty.
 */
export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		// `Navbar` hardcodes `role="navigation"`; `Subnav` has no equivalent
		// landmark role, so it's reached via its own rendered content instead.
		// `Community` itself is ALSO one of `Navbar`'s own top-level links (it's in
		// `HEADER_GLOBAL_NAV`), so the label lookup is scoped to `Subnav`'s own
		// label class to avoid ambiguity.
		await expect(canvas.getByRole('navigation')).toBeInTheDocument()
		await expect(canvas.getByText('Community', { selector: SUBNAV_LABEL_SELECTOR })).toBeInTheDocument()

		// One `menubar` from `Navbar` (`HEADER_GLOBAL_NAV`'s 3 routes), one from
		// `Subnav` (the flattened `Community` children).
		await expect(canvas.getAllByRole('menubar')).toHaveLength(2)
		await expect(canvas.getByRole('menuitem', { name: 'Events' })).toBeInTheDocument()
	},
}

/**
 * `subnav` omitted entirely: `Header` falls back to `listRoutesWithSlug(pathname)`,
 * using the CURRENT `usePathname()` value (mocked here via
 * `parameters.nextjs.navigation.pathname`). At `/community`, this resolves to the
 * same rendered result as passing `subnav={ { routes: COMMUNITY_ROUTES } }` explicitly
 * (`listRoutesWithSlug` walks the `Community` `NavigationItem`'s own nested `menu`,
 * which `Subnav`'s flattening branch renders directly regardless of exactly how many
 * descendant routes were matched).
 */
export const PathnameFallback: Story = {
	args: { subnav: undefined },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		await expect(canvas.getByText('Community', { selector: SUBNAV_LABEL_SELECTOR })).toBeInTheDocument()
		await expect(canvas.getAllByRole('menubar')).toHaveLength(2)
		await expect(canvas.getByRole('menuitem', { name: 'Events' })).toBeInTheDocument()
		await expect(canvas.getByRole('menuitem', { name: 'Feed' })).toBeInTheDocument()
		await expect(canvas.getByRole('menuitem', { name: 'Spotlights' })).toBeInTheDocument()
	},
}

/**
 * Edge case: at the home route (`/`), `listRoutesWithSlug('/')` matches nothing (no
 * top-level `NavigationItem`'s own route — or any child's — starts with `'/undefined'`,
 * the derived subdir for a slug with no path segments), so the fallback resolves to an
 * empty route list. `Subnav` guards its entire inner block with `!!navItems.length`, so
 * it renders nothing (not even its root wrapper's inner content) when that happens —
 * only `Navbar` is visible.
 */
export const NoSubnav: Story = {
	parameters: { nextjs: { appDirectory: true, navigation: { pathname: '/' } } },
	args: { subnav: undefined },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		await expect(canvas.getByRole('navigation')).toBeInTheDocument()
		await expect(canvas.getAllByRole('menubar')).toHaveLength(1)
		await expect(canvas.queryByText('Community', { selector: SUBNAV_LABEL_SELECTOR })).not.toBeInTheDocument()
	},
}

/**
 * `navbar.routes` is forwarded straight through to `Navbar`, independent of `subnav`.
 */
export const CustomNavbarRoutes: Story = {
	args: { navbar: { routes: [NavRoutes.MARKETPLACE] } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			nav = canvas.getByRole('navigation'),
			navItems = within(nav).getAllByRole('menuitem')

		await expect(navItems.map(item => item.textContent)).toEqual(['Marketplace'])
	},
}

export const AsElement: Story = {
	render: (args) => (
		<Row>
			<Group label='as="header" (default)'>
				<Header { ...args } />
			</Group>
			<Group label='as="div"'>
				<Header { ...args } as="div" />
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const roots = canvasElement.querySelectorAll(ROOT_SELECTOR)

		await expect(roots).toHaveLength(2)

		const [asHeader, asDiv] = Array.from(roots) as HTMLElement[]

		await expect(asHeader.tagName).toBe('HEADER')
		await expect(asDiv.tagName).toBe('DIV')
	},
}

/**
 * `unstyled` never removes the semantic base class (`inkq-header`) — `Header.module.scss`
 * declares only the root selector, with no config classes at all, so this only
 * suppresses that one CSS-module hash.
 */
export const Unstyled: Story = {
	parameters: { controls: { exclude: ['unstyled'] } },
	render: (args) => (
		<Row>
			<Group label="true">
				<Header { ...args } unstyled />
			</Group>
			<Group label="false">
				<Header { ...args } unstyled={ false } />
			</Group>
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

		await expect(unstyledRoot).toHaveClass('inkq-header')
		await expect(styledRoot).toHaveClass('inkq-header')
		expect(hasModuleClass(unstyledRoot, 'inkq-header')).toBe(false)
		expect(hasModuleClass(styledRoot, 'inkq-header')).toBe(true)
	},
}
