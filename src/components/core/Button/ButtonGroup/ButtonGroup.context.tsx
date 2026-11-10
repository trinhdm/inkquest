import { createCompoundCtx } from '@/lib/component/context'
import type { AnimationOptions, RevealItemProps } from '@/hooks/animation'
import type { Button } from '../Button'

type SharedButtonProp =
	| 'disabled'
	| 'loading'
	| 'priority'
	| 'size'

export interface ButtonGroupContext
	extends
		Pick<Button.Props, SharedButtonProp>,
		Pick<AnimationOptions, 'unstyled'>,
		RevealItemProps {}

export const {
	RootProvider: ButtonGroupProvider,
	useSafeRootCtx: useButtonGroupCtx,
	useRootProps: useButtonGroupProps,
} = createCompoundCtx<ButtonGroupContext>('Button.Group')
