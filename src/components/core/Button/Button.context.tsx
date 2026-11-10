import { createCompoundCtx } from '@/lib/component/context'
import type { AnimationOptions } from '@/hooks/animation'

export interface ButtonContext
	extends Pick<AnimationOptions, 'unstyled'> {}

export const {
	RootProvider: ButtonProvider,
	useRootCtx: useButtonCtx,
	useRootProps: useButtonProps,
} = createCompoundCtx<ButtonContext, 'Button'>('Button')

export const useButton = () => ({ useButtonCtx, useButtonProps })
