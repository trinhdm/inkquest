import { createRootCxt } from '@/lib/component'
import type { Button } from '../Button'

interface ButtonGroupCxtValue {
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
} = createRootCxt<ButtonGroupCxtValue>('ButtonGroup')
