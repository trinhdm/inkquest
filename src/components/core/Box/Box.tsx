import cx from 'clsx'
import { toPolymorphic } from './Polymorphic'
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
	attributes,
	classNames,
	styles,
	variant,
	...rest
}: BoxProps) => {
	const Element = as || 'div',
		theme = useTheme()

	const props = {
		...attributes,
		className: cx(classNames),
		style: styles,
		...rest
	}

	return <Element { ...props } />
}

_Box.displayName = '@/Box'
export const Box = toPolymorphic(_Box)
