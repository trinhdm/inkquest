import { useProps } from '@/hooks/useProps'
import { useReveal, type MaybeAnimationProps } from '@/hooks/animation'
import { buildSection } from './builder'
import { defineTokens, polymorphic } from '@/lib/component'
import { Box } from '@/components/polymorphic/Box'
import { Button } from '@/components/core/Button'
import { Container } from '../Container'
import type { ReactNode } from 'react'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import classes from './Section.module.scss'

const NAME = 'Section' as const
const DEFAULT_PROPS = {
	animated: true,
	duration: 600,
	layout: 'default',
	stagger: 150,
} as const

type SectionLayout =
	| 'blocks'
	| 'default'
	| 'cta'
	| 'hero'
	| 'split'

interface BaseSectionProps {
	children: ReactNode
}

interface SectionBlocksProps {
	eyebrow?: never
	layout: Extract<SectionLayout, 'blocks'>
	title?: never
}

interface SectionContentProps {
	eyebrow?: string
	layout?: Exclude<SectionLayout, 'blocks'>
	title?: string
}

type LayoutSectionProps =
	| SectionBlocksProps
	| SectionContentProps

type SectionProps =
	& BaseSectionProps
	& LayoutSectionProps
	& MaybeAnimationProps

interface SectionSpecs {
	defaults: { props: PropsDefaultList<typeof DEFAULT_PROPS> }
	props: SectionProps
	selectors: SectionSelectors
	subcomponents: {
		Button: typeof Button
	}
	tokens: SectionTokens
}

type SectionSelectors =
	| 'root' | 'inner'
	| 'eyebrow' | 'title'
	| 'description' | 'body'
	| 'cta'

type SectionTokens = {
	root:
		| '--reveal-duration'
		| '--reveal-stagger'
}

const tokens = defineTokens<SectionSpecs>(({ props }) => {
	const { duration, stagger } = props

	return {
		root: {
			'--reveal-duration': duration ? `${duration}ms` : undefined,
			'--reveal-stagger': stagger ? `${stagger}ms` : undefined,
		},
	}
})

export const Section = polymorphic<SectionSpecs>((_props, { useStyles }) => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { props, tokens })

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
