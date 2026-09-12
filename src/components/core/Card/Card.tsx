import Image from 'next/image'
import { useProps, useStyles } from '@/hooks'
import { extractOtherProps } from '@/utils/helpers'
import { Box, polymorphic } from '@/components/core/Box'
// import { CardItem } from './CardItem'
import type { ComponentProps } from 'react'
import classes from './Card.module.scss'

const NAME = 'Card' as const,
	DEFAULT_TAG = 'div' as const

interface CardProps {
	caption?: string
	hasTitleAlt?: boolean
	image?: ComponentProps<typeof Image>
	title: string
}

interface CardSpecs {
	defaults: {
		as: typeof DEFAULT_TAG
		props: 'hasTitleAlt'
	}
	props: CardProps
}

export const Card = polymorphic<CardSpecs>(_props => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props })

	const {
		caption,
		children,
		hasTitleAlt,
		image,
		title,
		...rest
	} = props

	const { as, others } = extractOtherProps(rest)
	const altDefault = hasTitleAlt ? title : '[ PHOTO ]'

	return (
		<Box as={ as } { ...styles('root') } { ...others }>
			<div { ...styles('wrapper') }>
				<div { ...styles('image') }>
					{ image && <Image { ...image } /> }
					<span { ...styles('image-caption') }>
						{ image?.alt ?? altDefault }
					</span>
				</div>
				<div { ...styles('info') }>
					<h3 { ...styles('title') }>{ title }</h3>
					{ caption && (
						<span { ...styles('caption', true) }>{ caption }</span>
					) }
				</div>
			</div>
		</Box>
	)
}, classes)

Card.displayName = NAME
Card.setDefaults({ props: {
	as: DEFAULT_TAG,
	hasTitleAlt: false,
} })

export declare namespace Card {
	export type Props = CardProps
	export type Specs = CardSpecs
}
