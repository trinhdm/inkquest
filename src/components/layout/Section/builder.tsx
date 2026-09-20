
import {
	isValidElement,
	Children,
	Fragment,
	type ElementType,
	type ReactNode,
} from 'react'

import { Button } from '@/components/core'
import { Grid } from '../Grid'
import type { RevealCounter, useStyles } from '@/hooks'
import type { Section } from './Section'

interface BuildSectionConfig {
	props: Section.Props
	reveal: RevealCounter
	styles: ReturnType<typeof useStyles>
}

const buildHeader = ({ props, reveal, styles }: BuildSectionConfig): ReactNode[] => {
	const { eyebrow, layout, title } = props
	const header: ReactNode[] = []

	if (!!eyebrow) {
		const tagline = <span { ...styles('eyebrow', true) } { ...reveal.next() }>{ eyebrow }</span>
		header.push(tagline)
	}

	if (!!title) {
		const Tag = layout === 'hero' ? 'h1' : 'h2',
			heading = <Tag { ...styles('title') } { ...reveal.next() }>{ title }</Tag>
		header.push(heading)
	}

	return header
}

const orderSection = (
	children: BuildSectionConfig['props']['children'],
	reveal: BuildSectionConfig['reveal']
) => {
	const buttons: ReactNode[] = [],
		items: ReactNode[] = []

	Children.toArray(children).forEach((child, index) => {
		const key = `section-${index}-desc`

		if (isValidElement(child) || typeof child === 'string') {
			const desc = <p key={ key } { ...reveal.next() }>{ child }</p>

			if (typeof child === 'string')
				items.push(desc)

			if (isValidElement(child)) {
				if (child.type === Fragment) items.push(desc)
				else if (child.type !== Button) items.push(child)
				else if (buttons.length < 2) buttons.push(child)
			}
		}
	})

	return { buttons, items }
}

const buildContent = ({ props, reveal, styles }: BuildSectionConfig): ReactNode[] => {
	const { children, layout } = props
	const { buttons, items } = orderSection(children, reveal)
	const content: ReactNode[] = []

	if (!!items?.length) {
		const [first] = items
		let args = { ...styles('description') },
			Tag: ElementType | undefined

		if (items.length > 1) {
			Tag = 'div'
		} else if (isValidElement(first) && first.type === Fragment) {
			args = { ...args, ...reveal.next() }
			Tag = 'p'
		}

		const description = !!Tag ? <Tag { ...args }>{ items }</Tag> : items,
			body = <div key="section-body" { ...styles('body') }>{ description }</div>

		content.push(body)
	}

	if (!!buttons?.length) {
		const cta = (
			<Button.Group
				key="section-cta"
				{ ...styles('cta') }
				hasPriority={ buttons.length > 1 }
				revealFrom={ reveal.reserve(buttons.length) }
				size={ layout === 'hero' ? 'lg' : 'md' }
			>
				{ buttons }
			</Button.Group>
		)

		content.push(cta)
	}

	return content
}

export const buildSection = (config: BuildSectionConfig) => {
	const { props: { layout }, styles } = config

	const header = buildHeader(config),
		content = buildContent(config),
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
