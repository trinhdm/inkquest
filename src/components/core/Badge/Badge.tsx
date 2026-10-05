import { extractOthers } from '@/hooks/useProps'
import { polymorphic } from '@/lib/component'
import { Box } from '@/components/polymorphic/Box'
import type { ReactNode } from 'react'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import type { Tone as ThemeTone, Variant as ThemeVariant } from '@/lib/theme/types'
import classes from './Badge.module.scss'

const NAME = 'Badge' as const,
	TAG = 'div' as const

const DEFAULT_PROPS = {
	as: TAG,
	shape: 'pill',
	variant: 'light',
} as const

interface BadgeProps {
	children: ReactNode
	fullWidth?: boolean
	shape?: 'round' | 'pill'
	size?: 'sm' | 'lg'
	tone?: ThemeTone
	variant?: ThemeVariant
}

interface BadgeSpecs {
	defaults: {
		as: typeof TAG
		props: PropsDefaultList<typeof DEFAULT_PROPS>
	}
	props: BadgeProps
	selectors: BadgeSelectors
}

type BadgeSelectors =
	| 'root' | 'inner'

export const Badge = polymorphic<BadgeSpecs>((_props, { useProps, useStyles, useVariants }) => {
	useVariants()
	const props = useProps(_props)
	const styles = useStyles({ props })

	const {
		as,
		children,
		fullWidth,
		shape,
		size,
		tone,
		variant,
		...rest
	} = props

	const others = extractOthers(rest)

	const clsx = {
		global: { block: fullWidth },
		module: { [`${size}`]: size },
	}

	const data = {
		tone,
		variant,
		block: !!fullWidth || null,
	}

	return (
		<Box
			{ ...styles('root', clsx) }
			{ ...others }
			as={ as }
			attributes={ { data } }
		>
			<Box as="span" { ...styles('inner') }>
				{ children }
			</Box>
		</Box>
	)
}, { name: NAME, classes })

Badge.set({
	defaultProps: DEFAULT_PROPS,
	displayName: NAME,
})

export declare namespace Badge {
	export type Props = BadgeProps
	export type Specs = BadgeSpecs

	export type Tone = ThemeTone
	export type Variant = ThemeVariant

	export type Size = NonNullable<Badge.Props['size']>
}
