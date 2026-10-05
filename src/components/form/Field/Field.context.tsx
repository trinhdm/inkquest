import { createRootCtx } from '@/lib/component/context'
import type { AnimationOptions } from '@/hooks/animation'
import type { Size } from '@/types/shared'

interface FieldIds {
	control: string
	error: string
}

interface SharedFieldProps
	extends Pick<AnimationOptions, 'unstyled'> {
	disabled?: boolean
	loading?: boolean
	required?: boolean
	size?: Size
}

export interface FieldContext
	extends Pick<AnimationOptions, 'unstyled'>  {
	disabled?: boolean
	hasError: boolean
	hasIcon: boolean
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

const fieldProps = [
	'disabled',
	'loading',
	'required',
	'size',
	'unstyled',
] as const satisfies readonly (keyof SharedFieldProps)[]

export const useChosenFieldProps = <P extends object>(_props: P) =>
	useFieldProps(_props, ...fieldProps)
