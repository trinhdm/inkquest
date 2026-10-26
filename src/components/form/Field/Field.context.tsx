import { createCompoundCtx } from '@/lib/component/context'
import type { ReactNode } from 'react'
import type { AnimationOptions } from '@/hooks/animation'
import type { Field } from './Field'
import type { FilterTuple } from '@/types/utils'

interface FieldIds {
	control: string
	error: string
	info: string
}

interface FieldAria {
	busy: boolean | undefined
	describedby: string | undefined
	invalid: boolean | undefined
	required: boolean | undefined
}

type FieldClsxLayout =
	Exclude<Field.Props['layout'], 'default' | undefined>

interface FieldClsx {
	selector: Record<FieldClsxLayout, boolean> & {
		error: boolean
	}
}

type SharedFieldProp =
	| 'disabled'
	| 'loading'
	| 'readonly'
	| 'required'
	| 'size'
	| 'type'

export interface SharedFieldProps
	extends Pick<Field.Props, SharedFieldProp>,
		Pick<AnimationOptions, 'unstyled'> {}

export interface FieldContext
	extends SharedFieldProps {
	aria: FieldAria
	clsx: FieldClsx
	hasError: boolean
	layout?: Field.Props['layout']
	icon?: ReactNode
	idx: FieldIds
	loader?: ReactNode
}

export const {
	RootProvider: FieldProvider,
	useRootCtx: useFieldCtx,
	useRootProps: useFieldProps,
} = createCompoundCtx<FieldContext, 'Field'>('Field')

const sharedFieldProps = [
	'disabled',
	'loading',
	'readonly',
	'required',
	'size',
	'type',
	'unstyled',
] as const satisfies readonly (keyof SharedFieldProps)[]

const textareaFieldProps = sharedFieldProps.filter(
	p => p !== 'type'
) as FilterTuple<typeof sharedFieldProps, 'type'>

const FIELD_PROP_MAP = {
	Textarea: textareaFieldProps,
	default: sharedFieldProps,
} as const

type FieldPropMap = typeof FIELD_PROP_MAP
type FieldNames = keyof FieldPropMap

// the context keys a control inherits, narrowed by the control's name
type ChosenFieldProp<C> =
	(C extends FieldNames ? FieldPropMap[C] : FieldPropMap['default'])[number]

export const useField = <C extends FieldNames | (string & {}) = 'default'>(
	component?: C
) => {
	const name = component && component in FIELD_PROP_MAP
		? component as FieldNames
		: 'default'

	// the lookup above mirrors `ChosenFieldProp<C>`, which TypeScript can't see through
	const selected = FIELD_PROP_MAP[name] as readonly ChosenFieldProp<C>[]

	const useChosenFieldProps = <P extends object>(_props: P) =>
		useFieldProps<P, ChosenFieldProp<C>>(_props, ...selected)

	return { useChosenFieldProps, useFieldCtx, useFieldProps }
}
