import Link from 'next/link'
import { Box, polymorphic, type BoxProps } from '@/components/core/Box'
import {
	ButtonGroup,
	type ButtonGroupProps, type ButtonGroupSpecs
} from './ButtonGroup'
import { setThemeCSS, type ColorVariable } from '@/lib/theme'
import { useProps, useStyles, useVariantStyles } from '@/hooks'
import classes from './Button.module.scss'
import type { ReactNode } from 'react'

type ButtonSize =
	| 'sm'
	| 'md'
	| 'lg'

type ButtonPriority =
	| 'primary'
	| 'secondary'
	| 'tertiary'

type ButtonVariant =
	| 'dark'
	| 'ghost'
	| 'light'
	| 'outline'
	| 'solid'
	| 'success'
	| 'warning'
	| 'danger'

// type ButtonVars = ColorVariable<typeof NAME>

interface ButtonProps extends BoxProps {
	children: ReactNode
	disabled?: boolean
	fullWidth?: boolean
	href?: string
	icon?: React.ReactNode | {
		color?: string
		name: string
		position?: 'left' | 'right'
	}
	loading?: boolean
	priority?: ButtonPriority
	size?: ButtonSize
	variant?: ButtonVariant
}

type ButtonSpecs = {
	// cssVars: { root: ButtonVars }
	default: { component: 'button' }
	props: ButtonProps
	subcomponents: {
		Group: typeof ButtonGroup,
	}
}

const NAME = 'Button' as const

const cssVars = setThemeCSS<ButtonSpecs>((theme, _props) => {
	// const colors = theme.getVariantColors({ theme, ..._props })
	// // const { tokens } = theme
	// console.log({ colors })

	return {
		root: {
			// ...variants,
			// '--button-pad': `${tokens.space.inset('sm')} ${tokens.space.inset('lg')}`,
		}
	}
})

export const Button = polymorphic<ButtonSpecs>(_props => {
	useVariantStyles(NAME)
	const props = useProps(NAME, _props)
	const styles = useStyles<ButtonSpecs>({
		name: NAME,
		classes,
		cssVars,
		props,
	})

	const {
		as,
		children,
		disabled,
		fullWidth,
		href,
		priority,
		size,
		variant,
		...rest
	} = props

	const component = (href ? Link : undefined) ?? as

	return (
		<Box
			as={ component }
			data={ {
				variant,
				priority,
				disabled,
				block: !!fullWidth,
			} }
			{ ...styles('root') }
			{ ...rest }
		>
			<Box as="span" { ...styles('inner') }>
				<Box as="span" { ...styles('label') }>
					{ children }
				</Box>
			</Box>
		</Box>
	)
}, classes)

Button.displayName = NAME
Button.Group = ButtonGroup

Button.setDefaults({
	props: {
		as: 'button',
		size: 'sm',
		variant: 'solid',
	}
})

export declare namespace Button {
	export type Props = ButtonProps
	export type Specs = ButtonSpecs

	export type Priority = ButtonPriority
	export type Size = ButtonSize
	export type Variant = ButtonVariant

	export namespace Group {
		export type Props = ButtonGroupProps
		export type Specs = ButtonGroupSpecs
	}
}
