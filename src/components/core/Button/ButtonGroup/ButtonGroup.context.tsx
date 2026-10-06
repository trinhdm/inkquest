import { createCompoundCtx } from '@/lib/component/context'
import type { AnimationOptions, RevealItemProps } from '@/hooks/animation'
import type { Button } from '../Button'

export interface ButtonGroupContext
	extends Pick<AnimationOptions, 'unstyled'>, RevealItemProps {
	disabled?: boolean
	loading?: boolean
	priority?: Button.Props['priority']
	size?: Button.Props['size']
}

export const {
	RootProvider: ButtonGroupProvider,
	useSafeRootCtx: useButtonGroupCtx,
	useRootProps: useButtonGroupProps,
} = createCompoundCtx<ButtonGroupContext>('Button.Group')
