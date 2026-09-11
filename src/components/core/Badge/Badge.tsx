import { useProps, useStyles, useVariantStyles } from '@/hooks'
import { extractOtherProps } from '@/utils/helpers'
import { Box, polymorphic } from '@/components/core/Box'
// import { setThemeCSS, type ColorVariable } from '@/lib/theme'
// import type { ReactNode } from 'react'
import classes from './Badge.module.scss'

const NAME = 'Badge' as const,
	TAG = 'div' as const

type BadgeVariant =
	| 'dark'
	| 'ghost'
	| 'light'
	| 'outline'
	| 'solid'
	| 'success'
	| 'warning'
	| 'danger'

// type BadgeVars = ColorVariable<typeof NAME>

interface BadgeProps {
	// children: ReactNode
	fullWidth?: boolean
	shape?: 'round' | 'pill'
	size?: 'sm' | 'lg'
	variant?: BadgeVariant
}

interface BadgeSpecs {
	// cssVars: { root: BadgeVars }
	default: { component: typeof TAG }
	props: BadgeProps
}

// const cssVars = setThemeCSS<BadgeSpecs>((theme, _props) => {
// 	return {
// 		root: {}
// 	}
// })

export const Badge = polymorphic<BadgeSpecs>(_props => {
	useVariantStyles(NAME)
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
Badge.setDefaults({
	props: {
		as: TAG,
		shape: 'pill',
		variant: 'light',
	}
})

export declare namespace Badge {
	export type Props = BadgeProps
	export type Specs = BadgeSpecs

	export type Variant = BadgeVariant
}
