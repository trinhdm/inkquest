import Image from 'next/image'
import { defineTokens } from '@/lib/component/tokens'
import { extractOthers } from '@/hooks/useProps'
import { keyHasValue } from '@/utils/helpers'
import { polymorphic } from '@/lib/component/factory'
import { Box } from '@/components/polymorphic/Box'
import type { AuthUser } from '@/providers/AuthProvider'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import type { Size } from '@/types/shared'
import classes from './Avatar.module.scss'

const NAME = 'Avatar' as const,
	TAG = 'span' as const

const DEFAULT_PROPS = {
	as: TAG,
	ring: false,
	size: 'lg',
} as const

interface AvatarProps {
	bgColor?: string										//	TODO
	ring?: boolean
	size?: Size
	user: AuthUser
}

interface AvatarSpecs {
	defaults: {
		as: typeof TAG
		props: PropsDefaultList<typeof DEFAULT_PROPS>
	}
	props: AvatarProps
	selectors: AvatarSelectors
	tokens: AvatarTokens
}

type AvatarSelectors =
	| 'root' | 'image' | 'text'

type AvatarTokens = {
	root:
		| '--avatar-background'
		| '--avatar-font-size'
		| '--avatar-icon-size'
		| '--avatar-ring'
}

const getInitials = (name: string) =>
	name.trim()
		.split(/\s+/)
		.slice(0, 2)
		.map(word => Array.from(word)[0])
		.join('')
		.toUpperCase()

const tokens = defineTokens<AvatarSpecs>()(({ props, theme }) => {
	const { bgColor, ring, size } = props
	let fontSize, iconSize

	if (!!size) {
		const avatarFontSizes: Record<Avatar.Size, string> = {
			sm: theme.fontSize('control'),
			md: theme.fontSize('caption'),
			lg: theme.fontSize('label'),
		}

		fontSize = avatarFontSizes[size]
		iconSize = theme.el.avatar.size(size)
	}

	return {
		root: {
			'--avatar-background': bgColor ? bgColor : theme.color.card('hover'),
			'--avatar-font-size': fontSize,
			'--avatar-icon-size': iconSize,
			'--avatar-ring': ring ? `0 0 0 2px ${theme.color.action()}` : undefined,
		},
	}
})

export const Avatar = polymorphic<AvatarSpecs>((_props, { useProps, useStyles }) => {
	const props = useProps(_props)
	const styles = useStyles({ props, tokens })

	const {
		as, bgColor, ring,
		size, user,
		...rest
	} = props

	const others = extractOthers(rest)

	const name = user.name ?? user.email,
		initials = getInitials(name)

	return (
		<Box
			{ ...styles('root') }
			{ ...others }
			as={ as }
			attributes={ { aria: {
				hidden: true,
			} } }
		>
			{ keyHasValue(user, 'avatar_url')
				? <Image
					{ ...styles('image') }
					fill
					alt={ `${name} icon` }
					src={ user.avatar_url }
				/>
				: <span { ...styles('text') }>{ initials }</span> }
		</Box>
	)
}, { name: NAME, classes })

Avatar.set({
	defaultProps: DEFAULT_PROPS,
	displayName: NAME,
})

export declare namespace Avatar {
	export type Props = AvatarProps
	export type Specs = AvatarSpecs

	export type Size = NonNullable<Avatar.Props['size']>
}
