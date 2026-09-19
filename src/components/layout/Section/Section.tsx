import { isValidElement, Children, type ReactNode } from 'react'
import { useProps, useReveal, useStyles, extractOtherProps, type RevealCounter } from '@/hooks'
import { polymorphic, Box } from '@/components/polymorphic'
import { setThemeCSS } from '@/lib/theme'
import { Button } from '@/components/core'
import { Container } from '../Container'
import { Grid } from '../Grid'
import classes from './Section.module.scss'

const NAME = 'Section' as const

type SectionLayout =
	| 'blocks'
	| 'default'
	| 'cta'
	| 'hero'
	| 'split'

interface SectionProps {
	children: ReactNode
	eyebrow?: string
	title?: string
	layout?: SectionLayout

	animated?: boolean
	duration?: number
	revealed?: boolean
	stagger?: number
	withinView?: boolean
}

interface SectionSpecs {
	props: SectionProps
	subcomponents: {
		Button: typeof Button
	}
}

const orderSection = (
	children: SectionProps['children'],
	styles: ReturnType<typeof useStyles>,
	reveal: RevealCounter
) => {
	const buttons: ReactNode[] = [],
		items: ReactNode[] = []

	Children.toArray(children).forEach((child, index) => {
		const key = `section-${ index }`

		if (typeof child === 'string') {
			const desc = <p key={ `${key}-desc` } { ...styles('description') }>{ child }</p>
			items.push(desc)
		}

		if (isValidElement<SectionProps>(child)) {
			if (child.type !== Button) items.push(child)
			else if (buttons.length < 2) buttons.push(child)
		}
	})

	const content: ReactNode[] = []

	if (!!items.length) {
		const description = items.length > 1
			? <div { ...styles('description') }>{ items }</div>
			: items
		const body = (
			<div key="section-body" { ...styles('body') } { ...reveal.next() }>
				{ description }
			</div>
		)

		content.push(body)
	}

	if (!!buttons.length) {
		const cta = (
			<Button.Group
				key="section-cta"
				{ ...styles('cta') }
				hasPriority={ buttons.length > 1 }
				revealFrom={ reveal.reserve(buttons.length) }
				size="lg"
			>
				{ buttons }
			</Button.Group>
		)

		content.push(cta)
	}

	return <>{ content }</>
}

const buildSection = (
	props: SectionProps,
	styles: ReturnType<typeof useStyles>,
	reveal: RevealCounter
) => {
	const { children, eyebrow, layout, title } = props,
		HTag = layout === 'hero' ? 'h1' : 'h2'

	const tagline = !!eyebrow && <span { ...styles('eyebrow', true) } { ...reveal.next() }>{ eyebrow }</span>,
		heading = !!title && <Box as={ HTag } { ...styles('title') } { ...reveal.next() }>{ title }</Box>

	const content = orderSection(children, styles, reveal),
		header = <>{ tagline }{ heading }</>,
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

const tokens = setThemeCSS<SectionSpecs>((theme, _props) => ({
	root: {
		'--reveal-duration': _props.duration ? `${_props.duration}ms` : undefined,
		'--reveal-stagger': _props.stagger ? `${_props.stagger}ms` : undefined,
	},
}))

export const Section = polymorphic<SectionSpecs>(_props => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props, tokens })

	const {
		animated,
		duration,
		revealed,
		stagger,
		withinView,
		//
		children,
		eyebrow,
		layout,
		title,
		...rest
	} = props

	const { others } = extractOtherProps(rest)

	const { orderReveal, ref, root } = useReveal<HTMLElement>({
		animated: animated && !props.unstyled,
		revealed,
		withinView,
	})

	const module = {
		[`${layout}`]: !!(layout && layout !== 'default')
	}

	return (
		<Box
			{ ...styles('root', { module }) }
			{ ...others }
			{ ...root }
			as={ Container }
			ref={ ref }
		>
			{ buildSection(props, styles, orderReveal()) }
		</Box>
	)
}, classes)

Section.displayName = NAME
Section.Button = Button
Section.setDefaults({
	props: {
		animated: true,
		layout: 'default',
		stagger: 200,
	}
})

export declare namespace Section {
	export type Props = SectionProps
	export type Specs = SectionSpecs
}
