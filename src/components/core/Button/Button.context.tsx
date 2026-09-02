import { createRootCxt } from '@/lib/component'

export interface ButtonCxtValue {
	displayName: string
	unstyled?: boolean
}

export const {
	RootCxtProvider: ButtonProvider,
	useSafeRootCxt: useButtonCxt,
	useRootProps: useButtonProps,
} = createRootCxt<ButtonCxtValue>('Button')
