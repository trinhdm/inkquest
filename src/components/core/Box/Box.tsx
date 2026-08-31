// import { useTheme } from '@/providers/ThemeProvider'
import { handleProps } from './utils/handle-props'
import { toPolymorphic, type PolymorphicProps } from './Polymorphic'
import type { ReactNode } from 'react'

const NAME = 'PolymorphicBox' as const

export interface BoxProps {
	children?: ReactNode
	unstyled?: boolean
}

export const Box = toPolymorphic((_props: PolymorphicProps<'div', BoxProps>) => {
	const {
		as,
		unstyled,
		...props
	} = handleProps(_props)

	const Element = as || 'div'
	// const theme = useTheme()

	return <Element { ...props } />
})

Box.displayName = NAME
