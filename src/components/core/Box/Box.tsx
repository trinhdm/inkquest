import cx from 'clsx'
import { toPolymorphic, type ComponentSpec, type PolymorphicRef, type Structure } from './Polymorphic'
import { useTheme } from '@/providers/ThemeProvider'
import type { ElementType, ReactNode } from 'react'

type BoxSpec = ComponentSpec<undefined, {
	children?: ReactNode
	disabled?: boolean
}>

export interface BoxProps
	extends Structure<BoxSpec> {
	as: ElementType
	ref?: PolymorphicRef<ElementType>
}


const _Box = ({
	as,
	attributes,
	classNames,
	styles,
	variant,
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
