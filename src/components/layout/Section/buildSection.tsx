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
	// footer: ReactElement<SectionFooter.Props> | undefined
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

	if (layout === 'blocks')
		return header

	if (!!eyebrow) {
		const tagline = (
			<span key={ `${id}-eyebrow` } { ...styles('eyebrow', true) } { ...reveal.next() }>
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
			case 'hero':
			case 'hero-split':
				clsxNames.push(`${Tag}-display`)
				break
			case 'hero-tight':
			case 'content':
				clsxNames.push(`h${order + 2}`)
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
	const { children } = props
	const items: ReactNode[] = []
	let footer: ReactElement<SectionFooter.Props> | undefined

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

		if (isText)
			items.push(<p key={ key } className="inkq-prose" { ...reveal.next() }>{ child }</p>)
		else if (isValidElement(child))
			items.push(child)
	})

	return { footer, items }
}

const buildContent = (
	{ id, props, reveal, styles }: BuildSectionConfig
): Pick<SectionParts, 'body' | 'footer'> => {
	const { footer, items } = sortContent({ id, props, reveal })
	const content: ReturnType<typeof buildContent> = {
		body: null,
		footer: undefined,
	}

	const { eyebrow, layout, title } = props,
		hasSiblings = !!(title || eyebrow || footer),
		isHeroTight = layout === 'hero-tight',
		isHeroVariation = layout === 'hero-split' || isHeroTight

	if (!!items?.length) {
		const [first] = items
		let args = { ...styles('description', { global: { prose: !isHeroTight } }) },
			DescTag: ElementType | undefined

		if (items.length > 1) {
			DescTag = 'div'
		} else if (isValidElement(first) && first.type === Fragment) {
			args = { ...args, ...reveal.next() }
			DescTag = 'p'
		}

		const description = !!DescTag && hasSiblings
			? <DescTag { ...args }>{ items }</DescTag>
			: items

		const key = `${id}-body`,
			body = hasSiblings && !isHeroVariation
				? <div key={ key } { ...styles('body') }>{ description }</div>
				: <Fragment key={ key }>{ description }</Fragment>

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
		case 'hero':
		case 'banner':
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
		case 'split':
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
