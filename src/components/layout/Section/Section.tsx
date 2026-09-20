import {
	isValidElement,
	Children,
	Fragment,
	type ElementType,
	type ReactNode,
} from 'react'

import {
	useProps,
	useReveal,
	useStyles,
	type MaybeAnimationProps,
	type RevealCounter,
} from '@/hooks'

import { polymorphic, Box } from '@/components/polymorphic'
import { setThemeCSS } from '@/lib/theme'
import { Button } from '@/components/core'
import { Container } from '../Container'
import { Grid } from '../Grid'
import classes from './Section.module.scss'

const NAME = 'Section' as const
const DEFAULT_PROPS = {
	animated: true,
	duration: 400,
	layout: 'default',
	stagger: 200,
} as const

type SectionLayout =
	| 'blocks'
	| 'default'
	| 'cta'
	| 'hero'
	| 'split'

interface BaseSectionProps {
	children: ReactNode
	eyebrow?: string
	layout?: SectionLayout
	title?: string
}

type SectionProps =
	& BaseSectionProps
	& MaybeAnimationProps

interface SectionSpecs {
	defaults: { props: keyof typeof DEFAULT_PROPS }
	props: SectionProps
	subcomponents: {
		Button: typeof Button
	}
}

const orderSection = (
	props: SectionProps,
	styles: ReturnType<typeof useStyles>,
	reveal: RevealCounter
) => {
	const { children, layout } = props
	const buttons: ReactNode[] = [],
		items: ReactNode[] = []

	Children.toArray(children).forEach((child, index) => {
		const key = `section-${index}-desc`

		if (isValidElement<SectionProps>(child) || typeof child === 'string') {
			const desc = <p key={ key } { ...reveal.next() }>{ child }</p>

			if (typeof child === 'string')
				items.push(desc)

			if (isValidElement<SectionProps>(child)) {
				if (child.type === Fragment) items.push(desc)
				else if (child.type !== Button) items.push(child)
				else if (buttons.length < 2) buttons.push(child)
			}
		}
	})

	const content: ReactNode[] = [],
		isHero = layout === 'hero'

	if (!!items.length) {
		const [first] = items
		let args = { ...styles('description') },
			Tag: ElementType | undefined

		if (items.length > 1) {
			Tag = 'div'
		} else if (isValidElement(first) && first.type === Fragment) {
			args = { ...args, ...reveal.next() }
			Tag = 'p'
		}

		const description = !!Tag?.length ? <Tag { ...args }>{ items }</Tag> : items,
			body = <div key="section-body" { ...styles('body') }>{ description }</div>

		content.push(body)
	}

	if (!!buttons.length) {
		const cta = (
			<Button.Group
				key="section-cta"
				{ ...styles('cta') }
				hasPriority={ buttons.length > 1 }
				revealFrom={ reveal.reserve(buttons.length) }
				size={ isHero ? 'lg' : 'md' }
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
	const { eyebrow, layout, title } = props,
		HTag = layout === 'hero' ? 'h1' : 'h2'

	const tagline = !!eyebrow && <span { ...styles('eyebrow', true) } { ...reveal.next() }>{ eyebrow }</span>,
		heading = !!title && <Box as={ HTag } { ...styles('title') } { ...reveal.next() }>{ title }</Box>

	const content = orderSection(props, styles, reveal),
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

const tokens = setThemeCSS<SectionSpecs>((theme, props) => {
	const { duration, stagger } = props

	return {
		root: {
			'--reveal-duration': duration ? `${duration}ms` : undefined,
			'--reveal-stagger': stagger ? `${stagger}ms` : undefined,
		},
	}
})

export const Section = polymorphic<SectionSpecs>(_props => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props, tokens })

	const {
		children,
		eyebrow,
		layout,
		title,
		...rest
	} = props

	const { others, ref, reveal } = useReveal<HTMLElement>(rest)

	const module = {
		[`${layout}`]: !!(layout && layout !== 'default')
	}

	return (
		<Box
			{ ...styles('root', { module }) }
			{ ...others }
			as={ Container }
			ref={ ref }
		>
			{ buildSection(props, styles, reveal()) }
		</Box>
	)
}, classes)

Section.displayName = NAME
Section.Button = Button
Section.setDefaults({ props: DEFAULT_PROPS })

export declare namespace Section {
	export type Props = SectionProps
	export type Specs = SectionSpecs
}
