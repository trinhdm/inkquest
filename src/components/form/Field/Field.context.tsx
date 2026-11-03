import { createCompoundCtx } from '@/lib/component/context'
import type { ReactNode } from 'react'
import type { AnimationOptions } from '@/hooks/animation'
import type { Field } from './Field'
import type { FilterTuple } from '@/types/utils'

interface FieldIds {
	control: string
	error: string
	info: string
	label: string
}

interface FieldAria {
	busy: boolean | undefined
	describedby: string | undefined
	invalid: boolean | undefined
	labelledby: string | undefined
	required: boolean | undefined
}

type FieldClsxLayout =
	Exclude<Field.Props['layout'], 'default' | undefined>

interface FieldClsx {
	selector: Record<FieldClsxLayout, boolean> & {
		error: boolean
	}
}

type FieldStateProp =
	| 'disabled'
	| 'invalid'
	| 'loading'
	| 'readonly'
	| 'required'

export type ControlFieldProps =
	& SharedFieldProps
	& { [K in FieldStateProp]?: never }

type SharedFieldProp =
	| 'size'
	| 'type'

interface SharedFieldProps
	extends
		Pick<Field.Props, SharedFieldProp>,
		Pick<AnimationOptions, 'unstyled'> {}

export interface FieldContext
	extends SharedFieldProps {
	aria: FieldAria
	clsx: FieldClsx
	disabled?: Field.Props['disabled']
	hasError: boolean
	layout?: Field.Props['layout']
	icon?: ReactNode
	idx: FieldIds
	loader?: ReactNode
	readonly?: Field.Props['readonly']
	required?: Field.Props['required']
}

export const {
	RootProvider: FieldProvider,
	useRootCtx: useFieldCtx,
	useRootProps: useFieldProps,
} = createCompoundCtx<FieldContext, 'Field'>('Field')

const SHARED_PROPS = [
	'size',
	'type',
	'unstyled',
] as const satisfies readonly (keyof SharedFieldProps)[]

const TYPELESS_PROPS = SHARED_PROPS.filter(
	p => p !== 'type'
) as FilterTuple<typeof SHARED_PROPS, 'type'>

const FIELD_PROP_MAP = {
	CodeInput: TYPELESS_PROPS,
	Textarea: TYPELESS_PROPS,
	default: SHARED_PROPS,
} as const

type FieldPropMap = typeof FIELD_PROP_MAP
type FieldNames = keyof FieldPropMap

//	the context keys a control inherits, narrowed by the control's name
type ChosenFieldProp<C> =
	(C extends FieldNames ? FieldPropMap[C] : FieldPropMap['default'])[number]

export const useField = <C extends FieldNames | (string & {}) = 'default'>(
	component?: C
) => {
	const name = component && component in FIELD_PROP_MAP
		? component as FieldNames
		: 'default'

	//	the lookup above mirrors `ChosenFieldProp<C>`, which TypeScript can't see through
	const selected = FIELD_PROP_MAP[name] as readonly ChosenFieldProp<C>[]

	const useChosenFieldProps = <P extends object>(_props: P) =>
		useFieldProps<P, ChosenFieldProp<C>>(_props, ...selected)

	return { useChosenFieldProps, useFieldCtx, useFieldProps }
}
