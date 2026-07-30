import cx from 'clsx'
import { toPolymorphic, type PolymorphicProps } from './Polymorphic'
import { useTheme } from '@/providers/ThemeProvider'
import type { ReactNode } from 'react'
import { filterProps } from '@/hooks/useProps'

export interface BoxProps {
	children?: ReactNode
	unstyled?: boolean
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

	const props = filterProps({
		...attributes,
		className: cx(classNames),
		style: styles,
		...rest
	}, true)

	return <Element { ...props } />
})

Box.displayName = '@/Box'
