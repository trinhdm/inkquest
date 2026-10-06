import Image from 'next/image'
import { extractOthers } from '@/hooks/useProps'
import { polymorphic } from '@/lib/component/factory'
import { Box } from '@/components/polymorphic/Box'
import type { ComponentProps } from 'react'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import classes from './Card.module.scss'

const NAME = 'Card' as const,
	TAG = 'div' as const

const DEFAULT_PROPS = {
	as: TAG,
	isAltTitle: false,
} as const

interface CardProps {
	caption?: string
	elevated?: boolean
	image?: ComponentProps<typeof Image>
	isAltTitle?: boolean
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
	const props = useProps(_props)
	const styles = useStyles({ props })

	const {
		as,
		caption,
		children,
		image,
		isAltTitle,
		title,
		...rest
	} = props

	const others = extractOthers(rest)

	const alt = isAltTitle ? title : '[ PHOTO ]',
		altText = image?.alt ?? alt

	return (
		<Box { ...styles('root') } { ...others } as={ as }>
			<div { ...styles('wrapper') }>
				<div { ...styles('image') }>
					{ image && <Image { ...image } alt={ altText } /> }
					<span { ...styles('image-caption') }>
						{ altText }
					</span>
				</div>

				<div { ...styles('info') }>
					<h3 { ...styles('title', { global: { h4: true } }) }>
						{ title }
					</h3>
					{ caption && (
						<span { ...styles('caption', true) }>{ caption }</span>
					) }
				</div>
			</div>
		</Box>
	)
}, { name: NAME, classes })

Card.set({
	defaultProps: DEFAULT_PROPS,
	displayName: NAME,
})

export declare namespace Card {
	export type Props = CardProps
	export type Specs = CardSpecs
}
