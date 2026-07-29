import cx from 'clsx'
import { toPolymorphic, type PolymorphicProps } from './Polymorphic'
import { useTheme } from '@/providers/ThemeProvider'
import type { ReactNode } from 'react'

export interface BoxProps {
	children?: ReactNode
}

export const Box = toPolymorphic((_props: PolymorphicProps<'div', BoxProps>) => {
	const {
		as,
		attributes,
		classNames,
		styles,
		...rest
	} = _props

	const theme = useTheme()
	const Element = as || 'div'

	const props = {
		...attributes,
		className: cx(classNames),
		style: styles,
		...rest
	}

	return <Element { ...props } />
})

Box.displayName = '@/Box'
