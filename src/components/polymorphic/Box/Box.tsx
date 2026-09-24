import { definePolymorphic, DEFAULT_TAG, POLYMORPHIC_MARKER } from '@/lib/component'
import { resolveProps } from './utils/resolveProps'
import type { ComponentType, ElementType, ReactNode } from 'react'

const NAME = 'Box' as const

interface BoxProps {
	children?: ReactNode
	unstyled?: boolean
}

type PolymorphicComponent =
	ComponentType<Record<string, unknown> & BoxProps>

const isPolymorphic = (target: ElementType): target is PolymorphicComponent =>
	typeof target !== 'string' && POLYMORPHIC_MARKER in target

export const Box = definePolymorphic<BoxProps, typeof DEFAULT_TAG>(_props => {
	const { as, unstyled, ...props } = resolveProps(_props)
	const Element = as || DEFAULT_TAG

	if (isPolymorphic(Element))
		return <Element { ...props } unstyled={ unstyled } />

	return <Element { ...props } />
})

Box.displayName = NAME
