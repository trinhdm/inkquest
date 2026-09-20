import { useProps, useStyles, useVariants, extractOtherProps } from '@/hooks'
import { polymorphic, Box, type ListProps } from '@/components/polymorphic'
import type { ReactNode } from 'react'
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
		props: ListProps<typeof DEFAULT_PROPS>
	}
	props: BadgeProps
}

export const Badge = polymorphic<BadgeSpecs>(_props => {
	useVariants(NAME)
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props })

	const {
		children,
		fullWidth,
		shape,
		size,
		variant,
		...rest
	} = props

	const { as, others } = extractOtherProps(rest)
	const data = { variant, block: !!fullWidth || null },
		global = { block: fullWidth }

	return (
		<Box
			as={ as }
			attributes={ { data } }
			{ ...styles('root', { global }) }
			{ ...others }
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
