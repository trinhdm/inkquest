import { expect, waitFor, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { Logo } from './Logo'
import type { ReactNode } from 'react'
import type { Route } from 'next'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import moduleClasses from './Logo.module.scss'

const BOOLEAN_OPTIONS = [true, false] as const

// Root tags exercised by the `As` story. `div` is the registered default.
const AS_OPTIONS = ['div', 'span'] as const

// `next/image`'s `loading` values. `eager` is the registered default.
const LOADING_OPTIONS = ['eager', 'lazy'] as const

// An absolute URL on another host, so `isExternalLink` is true.
const EXTERNAL_HREF: Route = 'https://example.com/inkquest'

// `Logo`'s only enumerable prop, a plain 2-value literal union — stays local rather
// than living in a shared `options.story.ts` (no sibling stories file in this family
// needs it).
const TYPE_OPTIONS: readonly NonNullable<Logo.Props['type']>[] = ['mark', 'wordmark']

const Row = ({ children }: { children: ReactNode }) => (
	<div style={ { display: 'flex', gap: 48, flexWrap: 'wrap', alignItems: 'flex-start' } }>
		{ children }
	</div>
)

const Group = ({ label, children }: { label: string, children: ReactNode }) => (
	<div style={ { display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' } }>
		<span style={ { font: 'var(--inkq-text-control)', letterSpacing: '.15em', textTransform: 'uppercase', opacity: 0.6 } }>
			{ label }
		</span>
		{ children }
	</div>
)

// `Logo`'s root class has its own SCSS declaration (`.inkq-logo { position: relative;
// ... }`), so this literal, always-present class name is a stable selector for
// reaching the root anchor regardless of state.
const ROOT_SELECTOR = '.inkq-logo'

// `LOGOS_CONFIG` (`Logo.tsx`): `'mark'` is a 40x40 square viewBox; `'wordmark'` is a
// 240x42 viewBox. `Logo` computes `height = Math.round(width * vb.height / vb.width)`.
const VIEWBOX = {
	mark: { height: 40, width: 40 },
	wordmark: { height: 42, width: 240 },
} as const

// `Logo.Props` (the `declare namespace` export) is just the raw `LogoProps`
// interface — it doesn't include `as`/`unstyled`/`attributes`/etc., which only exist
// on the actual accepted prop type, `PolymorphicProps<LogoProps, C>`.
// `Parameters<typeof Logo>[0]` reads that real, wrapped type straight off the
// component itself. It fills `C` with its constraint (`ElementType`), not the
// default `'div'` (`Logo.tsx`'s `TAG`), so `as` is any `ElementType` here.
type LogoStoryProps = Parameters<typeof Logo>[0]
type Story = StoryObj<LogoStoryProps>

const meta: Meta<LogoStoryProps> = {
	component: Logo,
	title: 'Navigation/Logo',
	argTypes: {
		alt: {
			control: 'text',
			description: 'Passed straight through to the underlying `next/image` `alt` attribute. Defaults to `` `${COMPANY_NAME} Logo` ``.',
		},
		as: {
			control: 'select',
			options: AS_OPTIONS,
			description: 'Registered default `div`. Only used when the logo is NOT a link: `Logo.tsx` renders `<Box as={ Link }>` whenever `href` is truthy (the `as` prop is ignored then), and `<Box as={ as }>` otherwise. See the `As` and `NoLink` stories.',
		},
		href: {
			control: 'text',
			description: 'Typed `Route | null`; registered default `\'/\'`. A truthy value renders the root as a `next/link` `Link`; an external URL also gets `target="_blank"` and `rel="noopener noreferrer"` (see `ExternalHref`). `null` (or any falsy value) renders no link at all, just the root tag from `as` (see `NoLink`).',
		},
		loading: {
			control: 'select',
			options: LOADING_OPTIONS,
			description: 'From next/image\'s `ImageProps` (`LogoProps` extends it minus `alt`/`height`/`fill`/`src`) and passed to the `<Image>`. Registered default `\'eager\'`. See the `Loading` story.',
		},
		type: {
			control: 'select',
			options: TYPE_OPTIONS,
			description: '`\'mark\'` renders a fixed square 40x40 viewBox image and ignores the active color scheme (`filename` is just `\'mark\'`); `\'wordmark\'` renders a 240x42 viewBox image whose filename is scheme-dependent (`` `wordmark-${colorScheme}` ``, e.g. `wordmark-dark.svg`). See the `Type` story.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Comes from `FactoryContract` (via `_PolymorphicContract`), not `Logo`\'s own `LogoProps`. `Logo` uses no config classes (both `styles(\'root\')` and `styles(\'image\')` are plain calls), so for the root and the image the visible effect is dropping the CSS-module-hashed class normally appended alongside each semantic base class (`inkq-logo`, `inkq-logo__image`, still emitted; both have plain SCSS declarations). `Logo` also passes `unstyled` to the root `<Box>`, which drops non-state `data-*` attributes — here that is the root\'s `data-scheme`. See the `Unstyled` story.',
		},
		width: {
			control: 'number',
			description: 'Drives the rendered `<Image>`\'s `width`; `height` is always DERIVED from it (`Math.round(width * vb.height / vb.width)`, using the active `type`\'s fixed aspect ratio from `LOGOS_CONFIG`) — there is no separate `height` prop. Defaults to `124`.',
		},
	},
	args: {
		...getDefaultProps<Logo.Props>('Logo'),
	},
}

export default meta

/**
 * Default `type` (`'wordmark'`) and `width` (`124`) — renders
 * `` `/logo/wordmark-${colorScheme}.svg` `` at `124 x round(124 * 42/240)`, with
 * `loading="eager"` on the image.
 */
export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			link = canvas.getByRole('link'),
			image = canvas.getByRole('img')

		await expect(link).toHaveAttribute('href', '/')
		await expect(image).toHaveAttribute('alt', 'Inkquest Logo')
		await expect(image).toHaveAttribute('width', '124')
		// `loading` is a prop now; its registered default is `'eager'`.
		await expect(image).toHaveAttribute('loading', 'eager')

		const expectedHeight = Math.round(124 * VIEWBOX.wordmark.height / VIEWBOX.wordmark.width)
		await expect(image).toHaveAttribute('height', String(expectedHeight))
	},
}

/**
 * `'mark'` is a fixed 40x40 square viewBox (so `height === width` at any size);
 * `'wordmark'` is a 240x42 viewBox (so `height` is roughly a sixth of `width`).
 */
export const Type: Story = {
	parameters: { controls: { exclude: ['type'] } },
	render: (args) => (
		<Row>
			{ TYPE_OPTIONS.map(type => (
				<Group key={ type } label={ type }>
					<Logo { ...args } type={ type } />
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			[mark, wordmark] = canvas.getAllByRole('img')

		const width = 124

		await expect(mark).toHaveAttribute('width', String(width))
		await expect(mark).toHaveAttribute('height', String(Math.round(width * VIEWBOX.mark.height / VIEWBOX.mark.width)))

		await expect(wordmark).toHaveAttribute('width', String(width))
		await expect(wordmark).toHaveAttribute('height', String(Math.round(width * VIEWBOX.wordmark.height / VIEWBOX.wordmark.width)))

		// `filename` (`Logo.tsx`): `'mark'` is scheme-independent, `'wordmark'` gets a
		// `-<colorScheme>` suffix. The active scheme isn't pinned here, so match either
		// (`ColorScheme` is `'dark' | 'light'`) rather than one literal; `next/image`
		// may URL-encode the path, so match the filename only.
		const markSrc = mark.getAttribute('src') ?? '',
			wordmarkSrc = wordmark.getAttribute('src') ?? ''

		expect(markSrc).toMatch(/mark\.svg/)
		expect(markSrc).not.toMatch(/wordmark/)
		expect(markSrc).not.toMatch(/-(dark|light)/)

		expect(wordmarkSrc).toMatch(/wordmark-(dark|light)\.svg/)
	},
}

/**
 * `height` is always derived from `width` via the active `type`'s fixed aspect
 * ratio — there's no independent `height` control to vary.
 */
export const Width: Story = {
	parameters: { controls: { exclude: ['width'] } },
	render: (args) => (
		<Row>
			{ [60, 124, 240].map(width => (
				<Group key={ width } label={ String(width) }>
					<Logo { ...args } width={ width } />
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			images = canvas.getAllByRole('img')

		await expect(images).toHaveLength(3)

		images.forEach((image, index) => {
			const width = [60, 124, 240][index]
			expect(image).toHaveAttribute('width', String(width))
			expect(image).toHaveAttribute(
				'height',
				String(Math.round(width * VIEWBOX.wordmark.height / VIEWBOX.wordmark.width)),
			)
		})
	},
}

/**
 * `href` is forwarded straight to the root `<Box as={ Link }>`.
 */
export const Href: Story = {
	args: { href: '/marketplace' },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		await expect(canvas.getByRole('link')).toHaveAttribute('href', '/marketplace')
	},
}

/**
 * `loading` goes straight to the `<Image>`. These checks read the DOM directly
 * rather than by role, so they do not depend on which scheme's logo is visible.
 */
export const Loading: Story = {
	parameters: { controls: { exclude: ['loading'] } },
	render: (args) => (
		<Row>
			{ LOADING_OPTIONS.map(loading => (
				<Group key={ loading } label={ loading }>
					<Logo { ...args } loading={ loading } />
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const images = canvasElement.querySelectorAll('.inkq-logo__image')

		await expect(images).toHaveLength(LOADING_OPTIONS.length)

		LOADING_OPTIONS.forEach((loading, index) => {
			expect(images[index]).toHaveAttribute('loading', loading)
		})
	},
}

/**
 * `as` only picks the root tag when the logo is not a link (`href` falsy). With a
 * truthy `href` the root is always a `Link`, so `href` is `null` here.
 */
export const As: Story = {
	parameters: { controls: { exclude: ['as', 'href'] } },
	render: (args) => (
		<Row>
			{ AS_OPTIONS.map(as => (
				<Group key={ as } label={ as }>
					<Logo { ...args } as={ as } href={ null } />
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const roots = Array.from(canvasElement.querySelectorAll(ROOT_SELECTOR))

		await expect(roots.map(root => root.tagName.toLowerCase())).toEqual([...AS_OPTIONS])

		roots.forEach(root => {
			expect(root.querySelector('a')).toBeNull()
			expect(root.querySelector('.inkq-logo__image')).not.toBeNull()
		})
	},
}

/**
 * `href: null` renders no `Link`: the root is a plain `div` (the registered `as`
 * default) wrapping the image.
 */
export const NoLink: Story = {
	args: { href: null },
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector(ROOT_SELECTOR) as HTMLElement

		await expect(root.tagName).toBe('DIV')
		await expect(root).not.toHaveAttribute('href')
		await expect(canvasElement.querySelector('a')).toBeNull()
		await expect(root.querySelector('.inkq-logo__image')).not.toBeNull()
	},
}

/**
 * An external `href` makes the `Link` open in a new tab with `rel="noopener
 * noreferrer"`; an internal one gets neither attribute.
 */
export const ExternalHref: Story = {
	parameters: { controls: { exclude: ['href'] } },
	render: (args) => (
		<Row>
			<Group label="internal">
				<Logo { ...args } href="/marketplace" />
			</Group>
			<Group label="external">
				<Logo { ...args } href={ EXTERNAL_HREF } />
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const [internal, external] = Array.from(canvasElement.querySelectorAll(ROOT_SELECTOR))

		await expect(internal.tagName).toBe('A')
		await expect(internal).not.toHaveAttribute('target')
		await expect(internal).not.toHaveAttribute('rel')

		await expect(external.tagName).toBe('A')
		await expect(external).toHaveAttribute('href', EXTERNAL_HREF)
		await expect(external).toHaveAttribute('target', '_blank')
		await expect(external).toHaveAttribute('rel', 'noopener noreferrer')
	},
}

/**
 * The root carries `data-scheme` set to the active color scheme (the preview
 * toolbar sets `data-inkq-scheme` on `<html>`), and the wordmark file follows it.
 * `_base.scss` hides `[data-scheme]` elements that disagree with the scheme.
 */
export const ColorScheme: Story = {
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector(ROOT_SELECTOR) as HTMLElement,
			image = canvasElement.querySelector('.inkq-logo__image') as HTMLElement

		await waitFor(() => {
			const scheme = document.documentElement.getAttribute('data-inkq-scheme') ?? ''

			expect(['dark', 'light']).toContain(scheme)
			expect(root).toHaveAttribute('data-scheme', scheme)
			expect(image.getAttribute('src') ?? '').toMatch(new RegExp(`wordmark-${scheme}\\.svg`))
		})
	},
}

/**
 * `unstyled` never removes the semantic base classes (`inkq-logo`,
 * `inkq-logo__image`) — both have plain, config-less SCSS declarations, so the
 * class-level difference is their CSS-module hash.
 */
export const Unstyled: Story = {
	parameters: { controls: { exclude: ['unstyled'] } },
	render: (args) => (
		<Row>
			{ BOOLEAN_OPTIONS.map(unstyled => (
				<Group key={ String(unstyled) } label={ String(unstyled) }>
					<Logo { ...args } unstyled={ unstyled } />
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const roots = Array.from(canvasElement.querySelectorAll(ROOT_SELECTOR)) as HTMLElement[]
		await expect(roots).toHaveLength(2)

		const [unstyledRoot, styledRoot] = roots

		const hasModuleClass = (el: Element, base: string) => {
			const moduleClass = (moduleClasses as Record<string, string>)[base]
			return !!moduleClass && el.classList.contains(moduleClass)
		}

		await expect(styledRoot).toHaveClass('inkq-logo')
		await expect(unstyledRoot).toHaveClass('inkq-logo')
		expect(hasModuleClass(styledRoot, 'inkq-logo')).toBe(true)
		expect(hasModuleClass(unstyledRoot, 'inkq-logo')).toBe(false)

		const styledImage = styledRoot.querySelector('.inkq-logo__image') as HTMLElement,
			unstyledImage = unstyledRoot.querySelector('.inkq-logo__image') as HTMLElement

		await expect(styledImage).toHaveClass('inkq-logo__image')
		await expect(unstyledImage).toHaveClass('inkq-logo__image')
		expect(hasModuleClass(styledImage, 'inkq-logo__image')).toBe(true)
		expect(hasModuleClass(unstyledImage, 'inkq-logo__image')).toBe(false)

		// `data-scheme` is not a state key, so `unstyled` strips it from the root.
		await expect(styledRoot).toHaveAttribute('data-scheme')
		await expect(unstyledRoot).not.toHaveAttribute('data-scheme')
	},
}
