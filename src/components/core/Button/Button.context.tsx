import { createRootCxt } from '@/lib/component'

export interface ButtonContext {
	unstyled?: boolean
}

export const {
	RootCxtProvider: ButtonProvider,
	useRootCxt: useButtonCxt,
	useRootProps: useButtonProps,
} = createRootCxt<ButtonContext>('Button')
