import { createRootCtx } from '@/lib/component/context'
import type { AnimationOptions } from '@/hooks/animation'
import type { Size } from '@/types/shared'

export interface FieldIds {
	control: string
	error: string
}

export interface FieldContext
	extends Pick<AnimationOptions, 'unstyled'>  {
	disabled?: boolean
	hasError: boolean
	idx: FieldIds
	loading?: boolean
	required?: boolean
	size?: Size
}

export const {
	RootProvider: FieldProvider,
	useRootCtx: useFieldCtx,
	useRootProps: useFieldProps,
} = createRootCtx<FieldContext>('Field')
