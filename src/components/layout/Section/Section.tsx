import { isValidElement, Children, type ReactNode } from 'react'
import { useProps, useStyles } from '@/hooks'
import { extractOtherProps } from '@/utils/helpers'
import { Box, polymorphic } from '@/components/core/Box'
import { Button } from '@/components/core'
import { Container } from '../Container'
import { Grid } from '../Grid'
import classes from './Section.module.scss'

const NAME = 'Section' as const

interface SectionProps {
	children: ReactNode
	eyebrow?: string
	title: string
	layout?:
		| 'default'
		| 'cta'
		| 'hero'
		| 'split'
}

interface SectionSpecs {
	props: SectionProps
	subcomponents: {
		Button: typeof Button
	}
}

const orderSection = (
	children: SectionProps['children'],
	styles: ReturnType<typeof useStyles>
) => {
	const buttons: ReactNode[] = [],
		content: ReactNode[] = [],
		items: ReactNode[] = []

	Children.toArray(children).forEach((child, index) => {
		const key = `section-${ index }`

		if (typeof child === 'string') {
			const desc = <p key={ `${key}-desc` } { ...styles('description') }>{ child }</p>
			content.push(desc)
		}

		if (isValidElement<SectionProps>(child)) {
			if (child.type !== Button) content.push(child)
			else if (buttons.length < 2) buttons.push(child)
		}
	})

	if (!!content.length) {
		const description = content.length > 1
			? <div key="section-desc" { ...styles('description') }>{ content }</div>
			: content
		items.push(description)
	}

	if (!!buttons.length) {
		const cta = (
			<Button.Group
				key="section-cta"
				hasPriority={ buttons.length > 1 }
				size="lg"
				{ ...styles('cta') }
			>
				{ buttons }
			</Button.Group>
		)

		items.push(cta)
	}

	return <>{ items }</>
}

const buildSection = (
	props: SectionProps,
	styles: ReturnType<typeof useStyles>
) => {
	const { children, eyebrow, layout, title } = props,
		HTag = layout === 'hero' ? 'h1' : 'h2'

	const header = <>
		<span { ...styles('eyebrow', { cn: 'eyebrow' }) }>{ eyebrow }</span>
		<Box as={ HTag } { ...styles('title') }>{ title }</Box>
	</>,
		content = orderSection(children, styles),
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

export const Section = polymorphic<SectionSpecs>(_props => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props })

	const {
		children,
		eyebrow,
		layout,
		title,
		...rest
	} = props

	const { others } = extractOtherProps(rest)
	const layoutClass = !!(layout && layout !== 'default') && `${NAME}--${layout}`

	return (
		<Box
			as={ Container }
			{ ...styles('root', { cn: layoutClass }) }
			{ ...others }
		>
			{ buildSection(props, styles) }
		</Box>
	)
}, classes)

Section.displayName = NAME
Section.Button = Button
Section.setDefaults({ props: { layout: 'default' } })

export declare namespace Section {
	export type Props = SectionProps
	export type Specs = SectionSpecs

	// export namespace Button {
	// 	export type Props = Button.Props
	// 	export type Specs = Button.Specs
	// }
}
