import { createRootCtx } from '@/lib/component'
import type { Button } from '../Button'
import type { RevealItemProps } from '@/hooks'

export interface ButtonGroupContext
	extends RevealItemProps {
	disabled?: boolean
	loading?: boolean
	priority?: Button.Priority
	size?: Button.Size
	unstyled?: boolean
}

export const {
	RootProvider: ButtonGroupProvider,
	useSafeRootCtx: useButtonGroupCtx,
	useRootProps: useButtonGroupProps,
} = createRootCtx<ButtonGroupContext>('Button.Group')
