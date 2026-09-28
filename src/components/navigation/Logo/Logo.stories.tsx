import { expect, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { Logo } from './Logo'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import moduleClasses from './Logo.module.scss'

const BOOLEAN_OPTIONS = [true, false] as const

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
// component itself. `LogoSpecs` declares no `defaults.as` (no `TAG` constant either),
// so `Logo` isn't genuinely polymorphic — `Logo.tsx` hardcodes `as={ Link }` on its
// root `<Box>` regardless of any `as` a caller passes; see the `as` `argTypes` entry.
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
			control: false,
			description: '`Logo.tsx` destructures `{ alt, href, type, width, ...rest }` from props and only forwards `{ others }` (NOT the destructured `as`) to its root `<Box>`, which itself hardcodes `as={ Link }` — so this control has no effect on the rendered tag, unlike `Subnav`\'s own genuinely-forwarded `as`.',
		},
		href: {
			control: 'text',
			description: 'The root `<Box as={ Link }>`\'s `href`. Defaults to `\'/\'`.',
		},
		type: {
			control: 'select',
			options: TYPE_OPTIONS,
			description: '`\'mark\'` renders a fixed square 40x40 viewBox image and ignores the active color scheme (`filename` is just `\'mark\'`); `\'wordmark\'` renders a 240x42 viewBox image whose filename is scheme-dependent (`` `wordmark-${colorScheme}` ``, e.g. `wordmark-dark.svg`). See the `Type` story.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Part of `PolymorphicProps` (via the shared `SpecsContract`), not `Logo`\'s own `LogoProps`. The semantic base classes (`inkq-logo`, `inkq-logo__image`) are ALWAYS emitted regardless — `unstyled` only suppresses the CSS-module-hashed class normally appended alongside each (both have plain, config-less SCSS declarations). See the `Unstyled` story.',
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
 * `` `/logo/wordmark-${colorScheme}.svg` `` at `124 x round(124 * 42/240)`.
 */
export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			link = canvas.getByRole('link'),
			image = canvas.getByRole('img')

		await expect(link).toHaveAttribute('href', '/')
		await expect(image).toHaveAttribute('alt', 'Inkquest Logo')
		await expect(image).toHaveAttribute('width', '124')

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
 * `unstyled` never removes the semantic base classes (`inkq-logo`,
 * `inkq-logo__image`) — both have plain, config-less SCSS declarations, so only
 * their CSS-module hash is suppressed.
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
	},
}
