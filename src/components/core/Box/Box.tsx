import cx from 'clsx'
import { polymorphic } from './Polymorphic'
import { useTheme } from '@/providers/ThemeProvider'
import type { CSSProperties, ElementType, ReactNode } from 'react'

export interface BoxProps {
	as: ElementType
	attributes?: Record<string, unknown>
	children?: ReactNode
	classNames?: string
	disabled?: boolean
	onBlur?: () => void
	onClick?: () => void
	onFocus?: () => void
	ref?: unknown
	styles?: CSSProperties
	variant?: string
}

const _Box = ({
	as,
	classNames,
	...rest
}: BoxProps) => {
	const Element = as || 'div',
		theme = useTheme()

	const props = {
		classNames: cx(classNames),
		...rest
	}

	return <Element { ...props } />
}

_Box.displayName = '@/Box'
export const Box = polymorphic(_Box)
