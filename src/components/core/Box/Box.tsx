import cx from 'clsx'
// import { useTheme } from '@/providers/ThemeProvider'
import { filterProps } from '@/hooks/useProps'
import { toPolymorphic, type PolymorphicProps } from './Polymorphic'
import type { ReactNode } from 'react'

export interface BoxProps {
	children?: ReactNode
	unstyled?: boolean
}

export const Box = toPolymorphic((_props: PolymorphicProps<'div', BoxProps>) => {
	const {
		as,
		attributes,
		className,
		classNames,
		style,
		styles,
		unstyled,
		...rest
	} = _props

	const Element = as || 'div'
	// const theme = useTheme()

	const props = filterProps({
		className: cx(classNames, className),
		...attributes,
		...rest,
		style: { ...style, ...styles },
	}, true)

	return <Element { ...props } />
})

Box.displayName = '@/Box'
