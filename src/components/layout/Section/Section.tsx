import { isValidElement, Children, type ReactNode, type ElementType } from 'react'
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
		| 'content'
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
			if (buttons.length < 2) buttons.push(child)
		}
	})

	if (!!content.length) {
		const description = content.length > 1
			? <div key="section-desc" { ...styles('description') }>{ content }</div>
			: content
		items.push(description)
	}

	if (!!buttons.length) {
		const cta = <Button.Group key="section-cta" size="lg" { ...styles('cta') }>{ buttons }</Button.Group>
		items.push(cta)
	}

	return <>{ items }</>
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

	const sharedProps = {
		as: 'section' as ElementType,
		...styles('root'),
		...others,
	}

	const heading = <>
		<span { ...styles('eyebrow', { global: 'eyebrow' }) }>
			{ eyebrow }
		</span>
		<Box as={ layout === 'hero' ? 'h1' : 'h2' } { ...styles('title') }>
			{ title }
		</Box>
	</>

	switch (layout) {
		case 'split':
			return (
				<Grid { ...sharedProps }>
					<Grid.Item>{ heading }</Grid.Item>
					<Grid.Item>{ orderSection(children, styles) }</Grid.Item>
				</Grid>
			)
		default:
			return (
				<Container { ...sharedProps }>
					{ heading }
					{ orderSection(children, styles) }
				</Container>
			)
	}

	// return (
	// 	<Container { ...sharedProps }>
	// 		{ heading }
	// 		{ orderSection(children, styles) }
	// 	</Container>
	// )
}, classes)

Section.displayName = NAME
Section.Button = Button
Section.setDefaults({ props: { layout: 'content' } })

export declare namespace Section {
	export type Props = SectionProps
	export type Specs = SectionSpecs

	// export namespace Button {
	// 	export type Props = Button.Props
	// 	export type Specs = Button.Specs
	// }
}
