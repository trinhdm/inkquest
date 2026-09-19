import {
	cloneElement, isValidElement, Children,
	type ReactNode, type CSSProperties,
} from 'react'
import { useProps, useReveal, useStyles } from '@/hooks'
import { extractOtherProps } from '@/utils/helpers'
import { setThemeCSS } from '@/lib/theme'
import { Box, polymorphic } from '@/components/core/Box'
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

type RevealItem =
	ReturnType<ReturnType<typeof useReveal>['item']>
type RevealFn =
	() => RevealItem

// index is caller-assigned, never derived from the DOM — heterogeneous slots
// (eyebrow, title, N content children, N buttons) are built in visual order,
// so the caller is the only thing that knows the true order
const orderReveal = (item: ReturnType<typeof useReveal>['item']): RevealFn => {
	let index = 0
	return () => item(index++)
}

// passes ONLY `data-reveal` + `style` — never `className` (would replace the
// child's base class via `inheritClasses`); `cloneElement` preserves `key`
// and `type`, so `ButtonGroup`'s `filterChildren` still matches on `Button`
const markReveal = (
	child: ReactNode,
	props: RevealItem
): ReactNode => {
	if (!isValidElement<{ style?: CSSProperties }>(child)) return child

	const style = { ...child.props.style, ...props.style }
	return cloneElement(child, { ...props, style })
}

const orderSection = (
	children: SectionProps['children'],
	styles: ReturnType<typeof useStyles>,
	reveal: RevealFn
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
		const revealed = items.map(child => markReveal(child, reveal())),
			wrapper = <div key="section-desc" { ...styles('description') }>{ revealed }</div>,
			description = revealed.length > 1 ? wrapper : revealed

		content.push(description)
	}

	if (!!buttons.length) {
		const cta = (
			<Button.Group
				key="section-cta"
				{ ...styles('cta') }
				hasPriority={ buttons.length > 1 }
				size="lg"
			>
				{ buttons.map(button => markReveal(button, reveal())) }
			</Button.Group>
		)

		content.push(cta)
	}

	return <>{ content }</>
}

const buildSection = (
	props: SectionProps,
	styles: ReturnType<typeof useStyles>,
	reveal: RevealFn
) => {
	const { children, eyebrow, layout, title } = props,
		HTag = layout === 'hero' ? 'h1' : 'h2'

	const heading = <Box as={ HTag } { ...styles('title') } { ...reveal() }>{ title }</Box>,
		tagline = <span { ...styles('eyebrow', true) } { ...reveal() }>{ eyebrow }</span>

	const content = orderSection(children, styles, reveal),
		header = <>{ !!eyebrow && tagline }{ !!title && heading }</>,
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
		children,
		eyebrow,
		layout,
		title,
		unstyled,
		withinView,
		...rest
	} = props

	const { others } = extractOtherProps(rest)

	const { item, ref, root } = useReveal<HTMLElement>({
		animated: animated && !unstyled,
		revealed: props.revealed,
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
			{ buildSection(props, styles, orderReveal(item)) }
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
