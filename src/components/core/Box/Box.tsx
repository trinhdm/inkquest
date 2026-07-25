import cx from 'clsx'
import { polymorphic } from './Polymorphic'
import { useTheme } from '@/providers/ThemeProvider'
import type { CSSProperties, ElementType, ReactNode } from 'react'

export interface BoxProps {
	as: ElementType
	children?: ReactNode
	className?: string
	disabled?: boolean
	onBlur?: () => void
	onClick?: () => void
	onFocus?: () => void
	ref?: any
	style?: CSSProperties
	variant?: string
}

const _Box = ({
	as,
	className,
	...rest
}: BoxProps) => {
	const Element = as || 'div',
		theme = useTheme()

	const props = {
		className: cx(className),
		...rest
	}

	return <Element { ...props } />
}

_Box.displayName = '@/Box'
export const Box = polymorphic(_Box)
