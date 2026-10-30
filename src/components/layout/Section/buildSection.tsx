import {
	isValidElement,
	Children,
	Fragment,
	type ElementType,
	type ReactElement,
	type ReactNode,
} from 'react'

import { partitionFooter, SectionFooter } from './SectionFooter'
import { verifyChildren } from '@/lib/component/children'
import { Grid } from '../Grid'
import { SectionProvider } from './Section.context'
import type { RevealCounter } from '@/hooks/animation'
import type { Section } from './Section'
import type { StyleFn } from '@/hooks/useStyles'

interface BuildSectionConfig {
	id: string
	props: Section.Props & { id?: string }
	reveal: RevealCounter
	styles: StyleFn<Section.Specs>
}

interface SectionParts {
	body: ReactNode
	eyebrow: ReactNode
	footer: ReactNode
	title: ReactNode
}

const buildHeader = (
	{ id, props, reveal, styles }: BuildSectionConfig
): Pick<SectionParts, 'eyebrow' | 'title'> => {
	const { eyebrow, layout, title } = props
	const header: ReturnType<typeof buildHeader> = {
		eyebrow: null,
		title: null,
	}

	if (layout === 'content-blocks')
		return header

	if (!!eyebrow) {
		const tagline = (
			<span key={ `${id}-eyebrow` } { ...styles('eyebrow') } { ...reveal.next() }>
				{ eyebrow }
			</span>
		)

		header.eyebrow = tagline
	}

	if (!!title) {
		const clsxNames: string[] = [],
			order = layout?.includes('hero') ? 1 : 2,
			Tag = `h${order}` as const

		switch (layout) {
			case 'hero-tight':
			case 'content':
				clsxNames.push(`h${order + 2}`)
				break
			case 'hero-split':
				clsxNames.push(`${Tag}-display`)
				break
		}

		const global = clsxNames.reduce<Record<string, boolean>>((acc, cn) => {
			acc[cn] = true
			return acc
		}, {})

		const headline = (
			<Tag key={ `${id}-title` } { ...styles('title', { global }) } { ...reveal.next() }>
				{ title }
			</Tag>
		)

		header.title = headline
	}

	return header
}

const sortContent = ({ id, props, reveal }: Omit<BuildSectionConfig, 'styles'>) => {
	const { children, layout } = props

	let footer: ReactElement<SectionFooter.Props> | undefined
	const text: ReactNode[] = [],
		items: ReactNode[] = []

	Children.toArray(children).forEach((child, i) => {
		if (isValidElement<SectionFooter.Props>(child) && child.type === SectionFooter) {
			const verifyArgs = { name: SectionFooter.displayName, total: 1 }

			if (!footer) footer = child
			else verifyChildren({ ...verifyArgs, children: [footer, child] })
			return
		}

		const key = `${id}-desc-${i}`
		const isText = typeof child === 'string'
			|| (isValidElement(child) && child.type === Fragment)
		const textClasses = layout === 'banner-note' ? {} : { className: 'inkq-prose' }

		if (isText)
			text.push(<p key={ key } { ...textClasses } { ...reveal.next() }>{ child }</p>)
		else if (isValidElement(child))
			items.push(child)
	})

	return { footer, items, text }
}

const buildContent = (
	{ id, props, reveal, styles }: BuildSectionConfig
): Pick<SectionParts, 'body' | 'footer'> => {
	const { footer, items, text } = sortContent({ id, props, reveal })
	const content: ReturnType<typeof buildContent> = {
		body: null,
		footer: undefined,
	}

	let blocks
	const { eyebrow, layout, title } = props,
		hasSiblings = !!(title || eyebrow || footer || items.length)

	const isBannerNote = layout === 'banner-note',
		isHeroTight = layout === 'hero-tight',
		isHeroVariation = layout === 'hero-split' || isHeroTight

	if (!!text?.length) {
		const clsx = { global: { prose: !isHeroTight && !isBannerNote } },
			[first] = text

		let args = { ...styles('description', clsx) },
			DescTag: ElementType | undefined

		if (text.length > 1 || !!items.length) {
			DescTag = 'div'
		} else if (isValidElement(first) && first.type === Fragment) {
			args = { ...args, ...reveal.next() }
			DescTag = 'p'
		}

		const description = !!DescTag && hasSiblings
			? <DescTag { ...args }>{ text }</DescTag>
			: text

		blocks = description
	}

	if (!!items.length) {
		blocks = <>{ blocks }{ items }</>
	}

	if (blocks) {
		const key = `${id}-body`
		const body = hasSiblings && !isHeroVariation
			? <div key={ key } { ...styles('body') }>{ blocks }</div>
			: <Fragment key={ key }>{ blocks }</Fragment>

		content.body = body
	}

	if (footer) {
		const { total } = partitionFooter(footer.props.children)

		const ctxValues: Section.Context = {
			revealFrom: reveal.reserve(total),
			size: layout === 'hero' ? 'lg' : 'md',
		}

		if (isHeroVariation)
			Object.assign(ctxValues, { as: Grid.Item, span: 1 })

		const footnote = (
			<SectionProvider key={ `${id}-footer` } value={ ctxValues }>
				{ footer }
			</SectionProvider>
		)

		content.footer = footnote
	}

	return content
}

export const buildSection = (config: Omit<BuildSectionConfig, 'id'>) => {
	const { props: { id, layout }, styles } = config,
		args = { ...config, id: id ?? `section` }

	const { eyebrow, title } = buildHeader(args),
		header = [eyebrow, title]

	const { body, footer } = buildContent(args),
		content = [body, footer]

	const inner = [header, content]

	switch (layout) {
		case 'banner':
		case 'content-form':
		case 'hero':
			return <div { ...styles('inner') }>{ inner }</div>
		case 'hero-split':
		case 'hero-tight':
			if (layout === 'hero-tight') header.reverse()

			const columns = !!footer ? 4 : undefined,
				span = !!columns ? columns - 1 : undefined

			return (
				<Grid columns={ columns } { ...styles('inner') }>
					<Grid.Item span={ span } { ...styles('content') }>
						{ header }{ body }
					</Grid.Item>
					{ footer }
				</Grid>
			)
		case 'banner-note':
			return (
				<div { ...styles('inner') }>{ inner }</div>
			)
		case 'content-split':
			return (
				<Grid { ...styles('inner') }>
					<Grid.Item>{ header }</Grid.Item>
					<Grid.Item>{ content }</Grid.Item>
				</Grid>
			)
		default:
			return inner
	}
}
