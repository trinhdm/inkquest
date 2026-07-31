import Link from 'next/link'
import { Box, polymorphic, type BoxProps } from '../../Box'
import { setThemeCSS } from '@/lib/colors'
import { useProps, useStyles } from '@/hooks'

import type { ReactNode } from 'react'
import type { ColorVariable } from '@/providers/ThemeProvider'

import classes from './Button.module.scss'

type ButtonSize =
	| 'sm'
	| 'md'
	| 'lg'

type ButtonPriority =
	| 'primary'
	| 'secondary'
	| 'tertiary'
	| 'accent'

type ButtonVariant =
	| 'dark'
	| 'ghost'
	| 'light'
	| 'outline'
	| 'solid'
	| 'success'
	| 'warning'
	| 'danger'

type ButtonVars = ColorVariable<_Prefix>
type EvenNumber = number & { readonly __brand: unique symbol }

interface ButtonProps extends BoxProps {
	children: ReactNode
	fullWidth?: boolean
	href?: string
	icon?: React.ReactNode | {
		color?: string
		name?: React.ReactNode
		position?: 'left' | 'right'
		size?: EvenNumber
	}
	priority?: ButtonPriority
	size?: ButtonSize
	variant?: ButtonVariant
}

type ButtonSpecs = {
	// asdf: ''
	cssVars: { root: ButtonVars }
	default: { component: 'button' }
	props: ButtonProps
}

const NAME = 'Button' as const
const PREFIX = `${NAME.toLowerCase() as Lowercase<typeof NAME>}` as const

type _Prefix = Lowercase<typeof NAME>

const cssVars = setThemeCSS<ButtonSpecs>((theme, { size, variant }) => {
	const colors = theme.getPalette({ theme, variant }),
		variables = theme.setPalette({ colors, name: PREFIX })

	return {
		root: variables
	}
})


export const Button = polymorphic<ButtonSpecs>(_props => {
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
			// role="group"
			as={ component }
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
})

Button.classes = classes
Button.displayName = NAME

Button.setDefaults({
	props: {
		as: 'button',
		fullWidth: false,
		priority: 'primary',
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
}
