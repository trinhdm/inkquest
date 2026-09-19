import { handleProps } from './utils/handleProps'
import { toPolymorphic, POLYMORPHIC } from '@/lib/component'
import type { ComponentType, ElementType, ReactNode } from 'react'

const NAME = 'PolymorphicBox' as const

interface BoxProps {
	children?: ReactNode
	unstyled?: boolean
}

type UnstyledComponent =
	ComponentType<Record<string, unknown> & BoxProps>

const forwardsUnstyled = (el: ElementType): el is UnstyledComponent =>
	typeof el !== 'string' && POLYMORPHIC in el

export const Box = toPolymorphic<BoxProps, 'div'>(_props => {
	const { as, unstyled, ...props } = handleProps(_props)
	const Element = as || 'div'

	if (forwardsUnstyled(Element))
		return <Element { ...props } unstyled={ unstyled } />

	return <Element { ...props } />
})

Box.displayName = NAME
