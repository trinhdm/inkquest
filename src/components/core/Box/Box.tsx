import cx from 'clsx'
import { toPolymorphic, type ComponentSpec, type SpecStructure } from './Polymorphic'
import { useTheme } from '@/providers/ThemeProvider'
import type { ElementType, ReactNode } from 'react'

type BoxSpec = ComponentSpec<ElementType, {
	// children?: ReactNode
	disabled?: boolean
}>

export interface BoxProps
	extends SpecStructure<BoxSpec> {
	// as: ElementType
	children?: ReactNode
}

const _Box = ({
	as,
	attributes,
	classNames,
	styles,
	// variant,
	...rest
}: BoxProps) => {
	const theme = useTheme()
	const Element = as || 'div'

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
