import {
	isValidElement,
	Children,
	Fragment,
	type ElementType,
	type ReactNode,
} from 'react'

import { Button } from '@/components/core/Button'
import { Grid } from '../Grid'
import { TextInput } from '@/components/form/TextInput'
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
	const { eyebrow, layout, title } = props
	const header: ReactNode[] = []

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

const orderSection = ({
	id,
	props: { children },
	reveal,
}: Omit<BuildSectionConfig, 'styles'>) => {
	const buttons: ReactNode[] = [],
		cta: ReactNode[] = [],
		items: ReactNode[] = []

	Children.toArray(children).forEach((child, index) => {
		const key = `${id}-desc-${index}`

		if (isValidElement(child) || typeof child === 'string') {
			const desc = <p key={ key } className="inkq-prose" { ...reveal.next() }>{ child }</p>

			if (typeof child === 'string')
				items.push(desc)

			if (isValidElement(child)) {
				if (child.type === Fragment) items.push(desc)
				else if (child.type === TextInput) cta.push(child)
				else if (child.type !== Button) items.push(child)
				else if (buttons.length < 2) buttons.push(child)
			}
		}
	})

	return { buttons, cta, items }
}

const buildContent = ({ id, props, reveal, styles }: BuildSectionConfig): ReactNode[] => {
	const { buttons, cta, items } = orderSection({ id, props, reveal })
	const content: ReactNode[] = []

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

		const description = !!DescTag ? <DescTag { ...args }>{ items }</DescTag> : items
		const key = `${id}-body`,
			body = !!(props.title || props.eyebrow || buttons?.length)
				? <div key={ key } { ...styles('body') }>{ description }</div>
				: <Fragment key={ key }>{ description }</Fragment>

		content.push(body)
	}

	if (!!cta?.length) {
		const footer = <div key={ `${id}-cta` } { ...styles('cta') }>{ cta }</div>
		content.push(footer)
	}

	if (!!buttons?.length) {
		const footer = (
			<Button.Group
				key={ `${id}-buttons` }
				{ ...styles('cta') }
				hasPriority={ buttons.length > 1 }
				revealFrom={ reveal.reserve(buttons.length) }
				size={ props.layout === 'hero' ? 'lg' : 'md' }
			>
				{ buttons }
			</Button.Group>
		)

		content.push(footer)
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
		case 'cta':
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
