import { useVariants } from '@/hooks/useVariants'
import { extractOtherProps } from '@/hooks/useProps'
import { polymorphic } from '@/lib/component'
import { Box } from '@/components/polymorphic/Box'
import type { ReactNode } from 'react'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import classes from './Badge.module.scss'

const NAME = 'Badge' as const,
	TAG = 'div' as const

const DEFAULT_PROPS = {
	as: TAG,
	shape: 'pill',
	variant: 'light',
} as const

type BadgeVariant =
	| 'dark'
	| 'ghost'
	| 'light'
	| 'outline'
	| 'solid'
	| 'success'
	| 'warning'
	| 'danger'

interface BadgeProps {
	children: ReactNode
	fullWidth?: boolean
	shape?: 'round' | 'pill'
	size?: 'sm' | 'lg'
	variant?: BadgeVariant
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

export const Badge = polymorphic<BadgeSpecs>((_props, { useProps, useStyles }) => {
	useVariants(NAME)
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { props })

	const {
		as,
		children,
		fullWidth,
		shape,
		size,
		variant,
		...rest
	} = props

	const others = extractOtherProps(rest)
	const data = { variant, block: !!fullWidth || null },
		global = { block: fullWidth }

	return (
		<Box
			{ ...styles('root', { global }) }
			{ ...others }
			as={ as }
			attributes={ { data } }
		>
			<Box as="span" { ...styles('inner') }>
				{ children }
			</Box>
		</Box>
	)
}, classes)

Badge.displayName = NAME
Badge.setDefaults({ props: DEFAULT_PROPS })

export declare namespace Badge {
	export type Props = BadgeProps
	export type Specs = BadgeSpecs

	export type Variant = BadgeVariant
}
