import {
	cloneElement,
	isValidElement,
	Children,
	Fragment,
	type ElementType,
	type ReactElement,
	type ReactNode,
} from 'react'

import { partitionFooter, SectionFooter } from './SectionFooter'
import { verifyChildren } from '@/lib/component'
import { Grid } from '../Grid'
import type { RevealCounter } from '@/hooks/animation'
import type { Section } from './Section'
import type { StyleFn } from '@/hooks/useStyles'

interface BuildSectionConfig {
	id: string
	props: Section.Props & { id?: string }
	reveal: RevealCounter
	styles: StyleFn<Section.Specs>
}

const buildHeader = ({ id, props, reveal, styles }: BuildSectionConfig): ReactNode[] => {
	const { eyebrow, layout, title } = props,
		header: ReactNode[] = []

	if (layout === 'blocks')
		return header

	if (!!eyebrow) {
		const tagline = (
			<span key={ `${id}-eyebrow` } { ...styles('eyebrow', true) } { ...reveal.next() }>
				{ eyebrow }
			</span>
		)
		header.push(tagline)
	}

	if (!!title) {
		const Tag = layout === 'hero' ? 'h1' : 'h2'
		const headline = (
			<Tag key={ `${id}-title` } { ...styles('title') } { ...reveal.next() }>
				{ title }
			</Tag>
		)
		header.push(headline)
	}

	return header
}

const orderSection = ({ id, props, reveal }: Omit<BuildSectionConfig, 'styles'>) => {
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

const buildContent = ({ id, props, reveal, styles }: BuildSectionConfig): ReactNode[] => {
	const { footer, items } = orderSection({ id, props, reveal }),
		content: ReactNode[] = []

	const { eyebrow, layout, title } = props,
		hasSiblings = !!(title || eyebrow || footer)

	if (!!items?.length) {
		const clsx = { global: { prose: true } },
			[first] = items

		let args = { ...styles('description', clsx) },
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
			body = hasSiblings
				? <div key={ key } { ...styles('body') }>{ description }</div>
				: <Fragment key={ key }>{ description }</Fragment>

		content.push(body)
	}

	if (footer) {
		const { total } = partitionFooter(footer.props.children)

		content.push(cloneElement(footer, {
			key: `${id}-footer`,
			revealFrom: reveal.reserve(total),
			size: footer.props.size ?? (layout === 'hero' ? 'lg' : 'md'),
		}))
	}

	return content
}

export const buildSection = (config: Omit<BuildSectionConfig, 'id'>) => {
	const { props: { id, layout }, styles } = config,
		args = { ...config, id: id ?? `section` }

	const header = buildHeader(args),
		content = buildContent(args),
		inner = <>{ header }{ content }</>

	switch (layout) {
		case 'hero':
		case 'banner':
			return <div { ...styles('inner') }>{ inner }</div>
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
