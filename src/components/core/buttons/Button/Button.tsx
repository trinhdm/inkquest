import Link from 'next/link'
import { Box, polymorphic, type BoxProps } from '../../Box'
import type { ReactNode } from 'react'

import classes from './Button.module.css'
import { useProps } from '@/hooks/useProps'

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

interface ButtonProps extends BoxProps {
	children: ReactNode
	fullWidth?: boolean
	href?: string
	onClick?: () => void
	priority?: ButtonPriority
	size?: ButtonSize
	variant?: ButtonVariant
}

type ButtonSpecs = {
	// asdf: ''
	default: { component: 'button' }
	props: ButtonProps
}

export const Button = polymorphic<ButtonSpecs>(_props => {
	const {
		as,
		children,
		href,
		// size,
		// variant,
		...rest
	} = useProps(Button.displayName, _props)

	const component = (href ? Link : undefined) ?? as

	return (
		<Box
			as={ component }
			{ ...rest }
		>
			{ children }
		</Box>
	)
})

Button.classes = classes
Button.displayName = 'Button'

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
