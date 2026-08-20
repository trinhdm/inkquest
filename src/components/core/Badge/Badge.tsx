import { Box, polymorphic, type BoxProps } from '@/components/core/Box'
import { useProps, useStyles, useVariantStyles } from '@/hooks'
// import { setThemeCSS, type ColorVariable } from '@/lib/theme'
import type { ReactNode } from 'react'
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

interface BadgeProps extends BoxProps {
	children: ReactNode
	fullWidth?: boolean
	shape?: 'round' | 'pill'
	size?: 'sm' | 'lg'
	variant?: BadgeVariant
}

type BadgeSpecs = {
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
	const styles = useStyles<BadgeSpecs>(NAME, { classes, props })

	const {
		as,
		children,
		fullWidth,
		variant,
		...rest
	} = props

	return (
		<Box
			as={ as }
			attributes={ {
				data: {
					variant,
					block: !!fullWidth || null,
				}
			} }
			{ ...styles('root') }
			{ ...rest }
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
