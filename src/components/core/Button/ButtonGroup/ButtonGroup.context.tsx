import { createRootCxt } from '@/lib/component'
import type { Button } from '../Button'

interface ButtonGroupCxtValue {
	disabled?: boolean
	loading?: boolean
	priority?: Button.Priority
	unstyled?: boolean
}

export const {
	RootCxtProvider: ButtonGroupProvider,
	useSafeRootCxt: useButtonGroupCxt,
	useRootProps: useButtonGroupProps,
} = createRootCxt<ButtonGroupCxtValue>('ButtonGroup')
