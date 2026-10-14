import { expect, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { Card } from './Card'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import moduleClasses from './Card.module.scss'

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

// `getClassName.tsx` emits the base class (`nameClassBase`, `inkq-card`) on
// the root no matter what the SCSS declares or whether `unstyled` is set, so
// it is a reliable selector. (`Card.module.scss` also happens to have an
// `.inkq-card` rule, which is what gives a hashed module class to suppress.)
const ROOT_SELECTOR = '.inkq-card'
const IMAGE_CAPTION_SELECTOR = '.inkq-card__image-caption'

// `Card.Props` (the `declare namespace` export) is just the raw `CardProps`
// interface — it doesn't include `as`/`unstyled`/`attributes`/etc., which
// only exist on the actual accepted prop type, `PolymorphicProps<CardProps,
// C>`. `Parameters<typeof Card>[0]` reads that real, wrapped type straight
// off the component itself. It fills `C` with its constraint (`ElementType`),
// not the default `'div'` (`Card.tsx`'s local `TAG` constant), so `as` is any
// `ElementType` here.
type CardStoryProps = Parameters<typeof Card>[0]
type Story = StoryObj<CardStoryProps>

const meta: Meta<CardStoryProps> = {
	component: Card,
	title: 'Core/Card',
	argTypes: {
		title: {
			control: 'text',
			description: 'Required. Rendered as the card\'s `<h3>` heading, and also feeds the caption-fallback chain when `isAltTitle` is set — see the `ImageCaptionPrecedence` story.',
		},
		caption: {
			control: 'text',
			description: 'Optional supporting text rendered below the title. Only rendered at all when truthy (`{ caption && <span ...>{caption}</span> }`) — see the `CaptionPresence` story.',
		},
		image: {
			control: 'object',
			description: 'Raw `next/image` props (`ComponentProps<typeof Image>`), spread onto an `<Image />` — except `alt`, which `Card.tsx` always overrides with its resolved `altText` (`image?.alt ?? alt`). When `image.alt` is present it wins over the fallback chain driven by `isAltTitle`; the same `altText` becomes both the rendered `<img alt>` and the visible image caption. See the `ImageAlt` and `ImageCaptionPrecedence` stories.',
		},
		isAltTitle: {
			control: 'boolean',
			description: 'Controls the fallback alt text when `image.alt` is absent: `alt = isAltTitle ? title : \'[ PHOTO ]\'`. The resolved text is `altText = image?.alt ?? alt` — an explicit `image.alt` always wins regardless of this prop — and is used for both the image caption and the `<img alt>`. See the `IsAltTitle`, `ImageAlt` and `ImageCaptionPrecedence` stories.',
		},
		elevated: {
			control: 'boolean',
			description: '**Probable source bug, verified against the live `Card.tsx`**: declared on `CardProps` but never destructured or read anywhere in the component body — it falls straight through `extractOthers(rest)`\'s `others` and gets spread onto the rendered root element as `elevated={true}`/`elevated={false}`. Since `elevated` isn\'t a recognized DOM/ARIA attribute, React silently DROPS it (booleans on unknown attributes are not rendered) and logs a dev-mode warning instead — it never actually reaches the DOM as `elevated=""` or similar. It has no visual or behavioral effect of any kind (no class, no style, no `data-*` attribute, no rendered DOM attribute), so no story exercises it beyond this doc note — asserting "elevated" behavior here would document something the component doesn\'t actually do.',
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
		// `isAltTitle` stays at its registered default (`false`) here, so the
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

// `altText = image?.alt ?? alt`, where `alt = isAltTitle ? title :
// '[ PHOTO ]'` — three distinct branches of the same precedence chain,
// checked here through the visible caption. `image.alt` is a required field
// on `next/image`'s own prop type, so this story reaches the fallback
// branches by omitting `image` entirely (which makes `image?.alt` undefined
// via optional chaining). The `ImageAlt` story below covers the same chain
// through the rendered `<img alt>`.
export const ImageCaptionPrecedence: Story = {
	parameters: { layout: 'padded' },
	render: () => (
		<Row>
			<Group label="image.alt set (wins over everything)">
				<Card
					title="Card title"
					isAltTitle
					image={ { src: '/globe.svg', alt: 'Explicit image alt', width: 160, height: 160 } }
				/>
			</Group>
			<Group label="no image, isAltTitle (falls back to title)">
				<Card title="Card title" isAltTitle />
			</Group>
			<Group label="no image, !isAltTitle (literal placeholder)">
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

// The same precedence chain, asserted on the rendered `<img alt>` rather than
// the caption: `Card.tsx` renders `<Image { ...image } alt={ altText } />`, so
// the attribute always carries the resolved `altText`. `image.alt` is
// required by `next/image`'s types, so the two fallback groups cast an
// `image` object that has no `alt` — plain JS callers can do the same.
const imageWithoutAlt = {
	src: '/globe.svg',
	width: 160,
	height: 160,
} as unknown as NonNullable<Card.Props['image']>

export const ImageAlt: Story = {
	parameters: { layout: 'padded' },
	render: () => (
		<Row>
			<Group label="image.alt set (wins over isAltTitle)">
				<Card
					title="Card title"
					isAltTitle
					image={ { ...imageWithoutAlt, alt: 'Explicit image alt' } }
				/>
			</Group>
			<Group label="no image.alt, isAltTitle (title)">
				<Card title="Card title" isAltTitle image={ imageWithoutAlt } />
			</Group>
			<Group label="no image.alt, !isAltTitle (placeholder)">
				<Card title="Card title" image={ imageWithoutAlt } />
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const images = within(canvasElement).getAllByRole('img')

		await expect(images).toHaveLength(3)

		const [explicitAlt, titleAlt, placeholderAlt] = images

		await expect(explicitAlt).toHaveAttribute('alt', 'Explicit image alt')
		await expect(titleAlt).toHaveAttribute('alt', 'Card title')
		await expect(placeholderAlt).toHaveAttribute('alt', '[ PHOTO ]')
	},
}

export const IsAltTitle: Story = {
	parameters: { controls: { exclude: ['isAltTitle'] } },
	render: (args) => (
		<Row>
			{ BOOLEAN_OPTIONS.map(isAltTitle => (
				<Group key={ String(isAltTitle) } label={ String(isAltTitle) }>
					<Card { ...args } image={ undefined } isAltTitle={ isAltTitle } />
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
// base class is not gated on `unstyled`; the CSS-module-hashed class normally
// appended alongside it is suppressed, and only where a hash exists to
// suppress in the first place (verified against the live `Card.module.scss`).
// `unstyled` ALSO suppresses config-driven global classes: `getConfigClasses`
// (`getClassName.tsx`) returns early when `check.isUnstyled`, which drops the
// title's `inkq-h4` and the caption's `inkq-caption` (asserted below).
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
		// heuristic (a styled element can also carry global config classes such
		// as `inkq-h4`/`inkq-caption`, which are not the module hash).
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

		// `Card.tsx` styles the title with `styles('title', { global: { h4:
		// true } })`, which adds the global `inkq-h4` class only when styled.
		await expect(styledTitle).toHaveClass('inkq-h4')
		await expect(unstyledTitle).not.toHaveClass('inkq-h4')

		// The `caption` selector (`styles('caption', true)`) has NO matching
		// rule in `Card.module.scss` (only `root`/`wrapper`/`image`/
		// `image-caption`/`title` do), so neither instance carries a module
		// class for it. Its suppression difference is the global `inkq-caption`
		// class `config: true` adds, which `getConfigClasses` drops when
		// unstyled.
		const styledCaption = styledRoot.querySelector('.inkq-card__caption') as HTMLElement,
			unstyledCaption = unstyledRoot.querySelector('.inkq-card__caption') as HTMLElement

		await expect(styledCaption).toHaveClass('inkq-card__caption')
		await expect(unstyledCaption).toHaveClass('inkq-card__caption')
		expect(hasModuleClass(styledCaption, 'inkq-card__caption')).toBe(false)
		expect(hasModuleClass(unstyledCaption, 'inkq-card__caption')).toBe(false)

		await expect(styledCaption).toHaveClass('inkq-caption')
		await expect(unstyledCaption).not.toHaveClass('inkq-caption')
	},
}
