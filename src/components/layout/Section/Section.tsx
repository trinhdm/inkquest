import {
	useProps,
	useReveal,
	useStyles,
	type MaybeAnimationProps,
} from '@/hooks'

import { polymorphic, Box, type ListProps } from '@/components/polymorphic'
import { setThemeCSS } from '@/lib/theme'
import { buildSection } from './builder'
import { Button } from '@/components/core'
import { Container } from '../Container'
import type { ReactNode } from 'react'
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
	defaults: { props: ListProps<typeof DEFAULT_PROPS> }
	props: SectionProps
	subcomponents: {
		Button: typeof Button
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
			{ buildSection({ props, reveal: reveal(), styles }) }
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
