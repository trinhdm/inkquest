import { useReveal, type MaybeAnimationProps } from '@/hooks/animation'
import { buildSection } from './buildSection'
import { defineTokens } from '@/lib/component/tokens'
import { polymorphic } from '@/lib/component/factory'
import { Box } from '@/components/polymorphic/Box'
import { Container } from '../Container'
import { SectionFooter } from './SectionFooter'
import type { ReactNode } from 'react'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import type { SectionContext } from './Section.context'
import classes from './Section.module.scss'

const NAME = 'Section' as const

const DEFAULT_PROPS = {
	animated: true,
	duration: 600,
	layout: 'default',
	stagger: 150,
} as const

const SUBCOMPONENTS = {
	Footer: SectionFooter,
} as const

type SectionLayout =
	| 'banner'
	| 'banner-note'
	| 'content'
	| 'content-blocks'
	| 'content-form'
	| 'content-split'
	| 'default'
	| 'hero'
	| 'hero-split'
	| 'hero-tight'

interface BaseSectionProps {
	alignText?: 'left' | 'center' | 'right'
	children: ReactNode
}

interface SectionBlocksProps {
	eyebrow?: never
	layout: Extract<SectionLayout, 'content-blocks'>
	title?: never
}

interface SectionContentProps {
	eyebrow?: string
	layout?: Exclude<SectionLayout, 'content-blocks'>
	title?: string
}

interface SectionHeaderProps {
	children?: never
	eyebrow?: string
	layout?: Extract<SectionLayout, 'default' | 'hero'>
	title?: string
}

type LayoutSectionProps =
	| SectionBlocksProps
	| SectionContentProps
	| SectionHeaderProps

type SectionProps =
	& BaseSectionProps
	& LayoutSectionProps
	& MaybeAnimationProps

interface SectionSpecs {
	defaults: { props: PropsDefaultList<typeof DEFAULT_PROPS> }
	props: SectionProps
	selectors: SectionSelectors
	subcomponents: typeof SUBCOMPONENTS
	tokens: SectionTokens
}

type SectionSelectors =
	| 'root' | 'inner'
	| 'eyebrow' | 'title'
	| 'description' | 'body'
	| 'content' | 'cta'

type SectionTokens = {
	root:
		| '--reveal-duration'
		| '--reveal-stagger'
	inner:
		| '--section-align'
}

const tokens = defineTokens<SectionSpecs>()(({ props }) => {
	const { alignText, duration, layout, stagger } = props
	let textAlign

	if (!!alignText)
		textAlign = alignText
	else if (layout === 'content-form')
		textAlign = 'left'
	else if (layout === 'banner')
		textAlign = 'center'

	return {
		root: {
			'--reveal-duration': duration ? `${duration}ms` : undefined,
			'--reveal-stagger': stagger ? `${stagger}ms` : undefined,
		},
		inner: {
			'--section-align': textAlign,
		},
	}
})

export const Section = polymorphic<SectionSpecs>((_props, { useProps, useStyles }) => {
	const props = useProps(_props)
	const styles = useStyles({ props, tokens })

	const {
		alignText, children,
		eyebrow, layout, title,
		...rest
	} = props

	const { others, ref, reveal } = useReveal<HTMLElement>(rest)

	const clsx = {
		module: { [`${layout}`]: !!(layout && layout !== 'default') },
	}

	return (
		<Box
			{ ...styles('root', clsx) }
			{ ...others }
			as={ Container }
			ref={ ref }
		>
			{ buildSection({ props, reveal: reveal(), styles }) }
		</Box>
	)
}, { name: NAME, classes })

Section.set({
	defaultProps: DEFAULT_PROPS,
	displayName: NAME,
	subcomponents: SUBCOMPONENTS,
})

export declare namespace Section {
	export type Context = SectionContext
	export type Props = SectionProps
	export type Specs = SectionSpecs

	export type Layout = SectionLayout

	export namespace Footer {
		export type Props = SectionFooter.Props
		export type Specs = SectionFooter.Specs
	}
}
