import { createRootCxt } from '@/lib/component'
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
	RootCxtProvider: ButtonGroupProvider,
	useSafeRootCxt: useButtonGroupCxt,
	useRootProps: useButtonGroupProps,
} = createRootCxt<ButtonGroupContext>('Button.Group')
