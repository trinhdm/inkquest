import { createRootCtx } from '@/lib/component'
import type { AnimationOptions } from '@/hooks'

export interface ButtonContext
	extends Pick<AnimationOptions, 'unstyled'> {}

export const {
	RootProvider: ButtonProvider,
	useRootCtx: useButtonCtx,
	useRootProps: useButtonProps,
} = createRootCtx<ButtonContext>('Button')
