import Image from 'next/image'
import { extractOthers } from '@/hooks/useProps'
import { polymorphic } from '@/lib/component'
import { Box } from '@/components/polymorphic/Box'
import type { ComponentProps } from 'react'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import classes from './Card.module.scss'

const NAME = 'Card' as const,
	TAG = 'div' as const

const DEFAULT_PROPS = {
	as: TAG,
	hasTitleAlt: false,
} as const

interface CardProps {
	caption?: string
	elevated?: boolean
	hasTitleAlt?: boolean
	image?: ComponentProps<typeof Image>
	title: string
}

interface CardSpecs {
	defaults: {
		as: typeof TAG
		props: PropsDefaultList<typeof DEFAULT_PROPS>
	}
	props: CardProps
	selectors: CardSelectors
}

type CardSelectors =
	| 'root' | 'wrapper'
	| 'image' | 'image-caption'
	| 'info' | 'title' | 'caption'

export const Card = polymorphic<CardSpecs>((_props, { useProps, useStyles }) => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { props })

	const {
		as,
		caption,
		children,
		hasTitleAlt,
		image,
		title,
		...rest
	} = props

	const others = extractOthers(rest)
	const altDefault = hasTitleAlt ? title : '[ PHOTO ]'

	return (
		<Box { ...styles('root') } { ...others } as={ as }>
			<div { ...styles('wrapper') }>
				<div { ...styles('image') }>
					{ image && <Image { ...image } /> }
					<span { ...styles('image-caption') }>
						{ image?.alt ?? altDefault }
					</span>
				</div>
				<div { ...styles('info') }>
					<h3 { ...styles('title', { global: { h4: true } }) }>{ title }</h3>
					{ caption && (
						<span { ...styles('caption', true) }>{ caption }</span>
					) }
				</div>
			</div>
		</Box>
	)
}, classes)

Card.displayName = NAME
Card.setDefaults({ props: DEFAULT_PROPS })

export declare namespace Card {
	export type Props = CardProps
	export type Specs = CardSpecs
}
