import Image from 'next/image'
import { useProps, useStyles, extractOtherProps } from '@/hooks'
import { polymorphic, Box, type ListProps } from '@/components/polymorphic'
import type { ComponentProps } from 'react'
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
		props: ListProps<typeof DEFAULT_PROPS>
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
Card.setDefaults({ props: DEFAULT_PROPS })

export declare namespace Card {
	export type Props = CardProps
	export type Specs = CardSpecs
}
