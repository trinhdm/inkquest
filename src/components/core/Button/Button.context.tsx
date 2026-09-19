import { createRootCtx } from '@/lib/component'

export interface ButtonContext {
	unstyled?: boolean
}

export const {
	RootProvider: ButtonProvider,
	useRootCtx: useButtonCtx,
	useRootProps: useButtonProps,
} = createRootCtx<ButtonContext>('Button')
