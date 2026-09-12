import { createRootCxt } from '@/lib/component'
import type { Button } from '../Button'

export interface ButtonGroupContext {
	disabled?: boolean
	loading?: boolean
	priority?: Button.Priority
	size?: Button.Size
	unstyled?: boolean
}

export const {
	RootCxtProvider: ButtonGroupProvider,
	useSafeRootCxt: useButtonGroupCxt,
	useRootProps: useButtonGroupProps,
} = createRootCxt<ButtonGroupContext>('ButtonGroup')
