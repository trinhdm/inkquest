import { Card } from './Card'
import { expect, within } from 'storybook/test'
import { getDefaultProps } from '@/lib/registries'
import moduleClasses from './Card.module.scss'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const BOOLEAN_OPTIONS = [true, false] as const

const Row = ({ children }: { children: ReactNode }) => (
	<div style={ { display: 'flex', gap: 24, flexWrap: 'wrap' } }>
		{ children }
	</div>
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

// `Card`'s root class always has its own SCSS declaration (`.inkq-card {
// position: relative; ... }`), so it reliably reaches the root regardless of
// `unstyled` — unlike `Container`'s root, which has no own declaration at
// all.
const ROOT_SELECTOR = '.inkq-card'
const IMAGE_CAPTION_SELECTOR = '.inkq-card__image-caption'

// `Card.Props` (the `declare namespace` export) is just the raw `CardProps`
// interface — it doesn't include `as`/`unstyled`/`attributes`/etc., which
// only exist on the actual accepted prop type, `PolymorphicProps<CardProps,
// C>`. `Parameters<typeof Card>[0]` reads that real, wrapped type straight
// off the component itself — the generic call signature's default `C`
// resolves to `'div'` here, since `CardSpecs`'s `defaults.as` is `'div'`
// (`Card.tsx`'s `DEFAULT_TAG`), matching `Card.setDefaults({ props: { as:
// DEFAULT_TAG, hasTitleAlt: false } })`.
type CardStoryProps = Parameters<typeof Card>[0]
type Story = StoryObj<CardStoryProps>

const meta: Meta<CardStoryProps> = {
	component: Card,
	title: 'Core/Card',
	argTypes: {
		title: {
			control: 'text',
			description: 'Required. Rendered as the card\'s `<h3>` heading, and also feeds the caption-fallback chain when `hasTitleAlt` is set — see the `ImageCaptionPrecedence` story.',
		},
		caption: {
			control: 'text',
			description: 'Optional supporting text rendered below the title. Only rendered at all when truthy (`{ caption && <span ...>{caption}</span> }`) — see the `CaptionPresence` story.',
		},
		image: {
			control: 'object',
			description: 'Raw `next/image` props (`ComponentProps<typeof Image>`), spread directly onto an `<Image />`. When `image.alt` is present it takes precedence over the caption-fallback chain driven by `hasTitleAlt` (`image?.alt ?? altDefault`) — see the `ImageCaptionPrecedence` story.',
		},
		hasTitleAlt: {
			control: 'boolean',
			description: 'Controls the image caption\'s fallback text when `image.alt` is absent: `altDefault = hasTitleAlt ? title : \'[ PHOTO ]\'`. The rendered caption text is `image?.alt ?? altDefault` — an explicit `image.alt` always wins regardless of this prop. See the `HasTitleAlt` and `ImageCaptionPrecedence` stories.',
		},
		elevated: {
			control: 'boolean',
			description: '**Probable source bug, verified against the live `Card.tsx`**: declared on `CardProps` but never destructured or read anywhere in the component body — it falls straight through `extractOtherProps(rest)`\'s `others` and lands as a raw, unrecognized DOM attribute on the rendered root element. It has no visual or behavioral effect of any kind (no class, no style, no `data-*` attribute), so no story exercises it beyond this doc note — asserting "elevated" behavior here would document something the component doesn\'t actually do.',
		},
	},
	args: {
		...getDefaultProps<Card.Props>('Card'),
		title: 'Card title',
		caption: 'A short supporting caption',
		image: {
			src: '/globe.svg',
			alt: 'A stylized globe icon',
			width: 320,
			height: 320,
		},
	},
}

export default meta

export const Default: Story = {}

export const WithoutImage: Story = {
	args: { image: undefined },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		await expect(canvas.queryByRole('img')).not.toBeInTheDocument()
		// `hasTitleAlt` stays at its registered default (`false`) here, so the
		// caption falls all the way through to the literal placeholder.
		await expect(canvas.getByText('[ PHOTO ]')).toBeInTheDocument()
	},
}

export const CaptionPresence: Story = {
	parameters: { layout: 'padded' },
	render: (args) => (
		<Row>
			<Group label="caption">
				<Card { ...args } />
			</Group>
			<Group label="no caption">
				<Card { ...args } caption={ undefined } />
			</Group>
		</Row>
	),
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement)

		// A single match across BOTH rendered cards confirms the "no caption"
		// group genuinely renders no caption element at all — `getByText`
		// throws on more than one match, which would happen if both groups
		// rendered it.
		await expect(canvas.getByText(args.caption as string)).toBeInTheDocument()
	},
}

// `image?.alt ?? altDefault`, where `altDefault = hasTitleAlt ? title :
// '[ PHOTO ]'` — three distinct branches of the same precedence chain.
// `image.alt` is a required field on `next/image`'s own prop type, so the
// only way to exercise the `hasTitleAlt` branches is to omit `image`
// entirely (which also makes `image?.alt` undefined via optional chaining).
export const ImageCaptionPrecedence: Story = {
	parameters: { layout: 'padded' },
	render: () => (
		<Row>
			<Group label="image.alt set (wins over everything)">
				<Card
					title="Card title"
					hasTitleAlt
					image={ { src: '/globe.svg', alt: 'Explicit image alt', width: 160, height: 160 } }
				/>
			</Group>
			<Group label="no image, hasTitleAlt (falls back to title)">
				<Card title="Card title" hasTitleAlt />
			</Group>
			<Group label="no image, !hasTitleAlt (literal placeholder)">
				<Card title="Card title" />
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const captions = canvasElement.querySelectorAll(IMAGE_CAPTION_SELECTOR)

		await expect(captions).toHaveLength(3)

		const [imageAltWins, titleFallback, literalFallback] = Array.from(captions)

		await expect(imageAltWins).toHaveTextContent('Explicit image alt')
		await expect(titleFallback).toHaveTextContent('Card title')
		await expect(literalFallback).toHaveTextContent('[ PHOTO ]')
	},
}

export const HasTitleAlt: Story = {
	parameters: { controls: { exclude: ['hasTitleAlt'] } },
	render: (args) => (
		<Row>
			{ BOOLEAN_OPTIONS.map(hasTitleAlt => (
				<Group key={ String(hasTitleAlt) } label={ String(hasTitleAlt) }>
					<Card { ...args } image={ undefined } hasTitleAlt={ hasTitleAlt } />
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const captions = canvasElement.querySelectorAll(IMAGE_CAPTION_SELECTOR)

		await expect(captions).toHaveLength(2)

		const [withTitleAlt, withoutTitleAlt] = Array.from(captions)

		await expect(withTitleAlt).toHaveTextContent('Card title')
		await expect(withoutTitleAlt).toHaveTextContent('[ PHOTO ]')
	},
}

export const AsElement: Story = {
	parameters: { layout: 'padded' },
	render: (args) => (
		<Row>
			<Group label='as="div" (default)'>
				<Card { ...args } />
			</Group>
			<Group label='as="article"'>
				<Card { ...args } as="article" />
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const headings = within(canvasElement).getAllByRole('heading', { level: 3 })

		await expect(headings).toHaveLength(2)

		const [asDiv, asArticle] = headings.map(
			heading => heading.closest(ROOT_SELECTOR) as HTMLElement
		)

		await expect(asDiv.tagName).toBe('DIV')
		await expect(asArticle.tagName).toBe('ARTICLE')
	},
}

// `unstyled` does NOT remove `Card`'s own semantic base classes (`inkq-card`,
// `inkq-card__wrapper`, `inkq-card__image`, `inkq-card__title`, ...) — the
// base class is always emitted regardless of `unstyled`; only the
// CSS-module-hashed class normally appended alongside it is suppressed, and
// only where a hash exists to suppress in the first place (verified against
// the live `Card.module.scss`).
export const Unstyled: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['unstyled'] },
	},
	render: (args) => (
		<Row>
			{ BOOLEAN_OPTIONS.map(unstyled => (
				<Group key={ String(unstyled) } label={ String(unstyled) }>
					<Card { ...args } unstyled={ unstyled } />
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			headings = canvas.getAllByRole('heading', { level: 3 })

		await expect(headings).toHaveLength(2)

		// `BOOLEAN_OPTIONS` is `[true, false]`, so the FIRST rendered group is
		// `unstyled` and the SECOND is styled — matches the render order above.
		const [unstyledRoot, styledRoot] = headings.map(
			heading => heading.closest(ROOT_SELECTOR) as HTMLElement
		)

		// Detect the REAL compiled CSS-module hash, keyed off the actual
		// `Card.module.scss` export map — not a naive "any extra class"
		// heuristic (`getConfigClasses` in `getClassName.tsx` emits
		// modifier/global classes regardless of `unstyled`, so "any class
		// beyond the base" is a false positive).
		const hasModuleClass = (el: Element, base: string) => {
			const moduleClass = (moduleClasses as Record<string, string>)[base]
			return !!moduleClass && el.classList.contains(moduleClass)
		}

		await expect(styledRoot).toHaveClass('inkq-card')
		await expect(unstyledRoot).toHaveClass('inkq-card')
		expect(hasModuleClass(styledRoot, 'inkq-card')).toBe(true)
		expect(hasModuleClass(unstyledRoot, 'inkq-card')).toBe(false)

		const styledWrapper = styledRoot.querySelector('.inkq-card__wrapper') as HTMLElement,
			unstyledWrapper = unstyledRoot.querySelector('.inkq-card__wrapper') as HTMLElement

		await expect(styledWrapper).toHaveClass('inkq-card__wrapper')
		await expect(unstyledWrapper).toHaveClass('inkq-card__wrapper')
		expect(hasModuleClass(styledWrapper, 'inkq-card__wrapper')).toBe(true)
		expect(hasModuleClass(unstyledWrapper, 'inkq-card__wrapper')).toBe(false)

		const styledImage = styledRoot.querySelector('.inkq-card__image') as HTMLElement,
			unstyledImage = unstyledRoot.querySelector('.inkq-card__image') as HTMLElement

		await expect(styledImage).toHaveClass('inkq-card__image')
		await expect(unstyledImage).toHaveClass('inkq-card__image')
		expect(hasModuleClass(styledImage, 'inkq-card__image')).toBe(true)
		expect(hasModuleClass(unstyledImage, 'inkq-card__image')).toBe(false)

		const styledTitle = styledRoot.querySelector('.inkq-card__title') as HTMLElement,
			unstyledTitle = unstyledRoot.querySelector('.inkq-card__title') as HTMLElement

		await expect(styledTitle).toHaveClass('inkq-card__title')
		await expect(unstyledTitle).toHaveClass('inkq-card__title')
		expect(hasModuleClass(styledTitle, 'inkq-card__title')).toBe(true)
		expect(hasModuleClass(unstyledTitle, 'inkq-card__title')).toBe(false)

		// **Source quirk, verified against `Card.module.scss`**: the `info` and
		// `caption` selectors `Card.tsx` calls `styles('info')`/`styles('caption',
		// true)` for have NO matching rule in the stylesheet at all (only
		// `root`/`wrapper`/`image`/`image-caption`/`title` do) — `getStyleClass()`
		// finds no compiled hash to append regardless of `unstyled`, so neither
		// instance ever carries a module class for this selector. Asserting a
		// suppression difference here would document behavior the component
		// doesn't actually have.
		const styledCaption = styledRoot.querySelector('.inkq-card__caption') as HTMLElement,
			unstyledCaption = unstyledRoot.querySelector('.inkq-card__caption') as HTMLElement

		await expect(styledCaption).toHaveClass('inkq-card__caption')
		await expect(unstyledCaption).toHaveClass('inkq-card__caption')
		expect(hasModuleClass(styledCaption, 'inkq-card__caption')).toBe(false)
		expect(hasModuleClass(unstyledCaption, 'inkq-card__caption')).toBe(false)
	},
}
