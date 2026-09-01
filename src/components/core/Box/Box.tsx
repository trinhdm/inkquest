// import { useTheme } from '@/providers/ThemeProvider'
import { handleProps } from './utils/handle-props'
import { toPolymorphic } from './Polymorphic'
import type { ReactNode } from 'react'

const NAME = 'PolymorphicBox' as const

export interface BoxProps {
	children?: ReactNode
	unstyled?: boolean
}

export const Box = toPolymorphic<BoxProps, 'div'>((_props) => {
	const {
		as,
		unstyled,
		...props
	} = handleProps(_props)

	const Element = as || 'div'
	// console.log(as)
	// const theme = useTheme()

	return <Element { ...props } />
})

Box.displayName = NAME
