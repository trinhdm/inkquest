import { createCompoundCtx } from '@/lib/component/context'
import type { ReactNode } from 'react'
import type { AnimationOptions } from '@/hooks/animation'
import type { Field } from './Field'

interface FieldIds {
	control: string
	error: string
}

interface FieldAria {
	busy: boolean | undefined
	describedby: string | undefined
	invalid: boolean | undefined
	required: boolean | undefined
}

interface FieldClsx {
	selector: Pick<Field.Props, 'layout'> & {
		error: boolean
	}
}

type SharedFieldProp =
	| 'disabled'
	| 'loading'
	| 'required'
	| 'size'

export interface SharedFieldProps
	extends Pick<Field.Props, SharedFieldProp>,
		Pick<AnimationOptions, 'unstyled'> {}

export interface FieldContext
	extends SharedFieldProps {
	aria: FieldAria
	clsx: FieldClsx
	hasError: boolean
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
	'required',
	'size',
	'unstyled',
] as const satisfies readonly (keyof SharedFieldProps)[]

export const useChosenFieldProps = <P extends object>(_props: P) =>
	useFieldProps(_props, ...sharedFieldProps)

export const useField = () => ({ useChosenFieldProps, useFieldCtx, useFieldProps })
