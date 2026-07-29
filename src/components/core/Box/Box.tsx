import cx from 'clsx'
import { toPolymorphic, type PolymorphicProps } from './Polymorphic'
// import { useTheme } from '@/providers/ThemeProvider'
import type { ReactNode } from 'react'

export interface BoxProps {
	children?: ReactNode
}

const _Box = ({
	as,
	attributes,
	classNames,
	styles,
	...rest
}: PolymorphicProps<'div', BoxProps>) => {
	// const theme = useTheme()
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
