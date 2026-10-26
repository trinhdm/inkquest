import { useField, type Field } from '../Field'
import { deepMerge } from '@/utils/helpers'
import { defineTokens } from '@/lib/component/tokens'
import { extractOthers } from '@/hooks/useProps'
import { listSharedTokens, type FlattenInputTokens } from '../utils'
import { polymorphic } from '@/lib/component/factory'
import { Box } from '@/components/polymorphic/Box'
import type { ChangeEventHandler } from 'react'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import classes from './Textarea.module.scss'

const NAME = 'Textarea' as const,
	TAG = 'textarea' as const

const DEFAULT_PROPS = {
	as: TAG,
	resizable: true,
	rows: 4,
	max: 8,
	min: 3,
} as const

interface BaseTextareaProps {
	name: string
	onChange?: ChangeEventHandler<HTMLTextAreaElement>
	placeholder?: string
	readonly?: boolean
	rows?: number
	value?: string
}

interface StaticTextareaProps {
	max?: never
	min?: never
	resizable?: false | never
}

interface DynamicTextareaProps {
	max?: number
	min?: number
	resizable: true
}

type SizableTextareaProps =
	| DynamicTextareaProps
	| StaticTextareaProps

type TextareaProps =
	& Omit<Field.SharedProps, 'type'>
	& BaseTextareaProps
	& SizableTextareaProps

interface TextareaSpecs {
	context: Field.Context
	defaults: {
		as: typeof TAG
		props: PropsDefaultList<typeof DEFAULT_PROPS>
	}
	props: TextareaProps
	selectors: TextareaSelectors
	tokens: TextareaTokens
}

type TextareaSelectors =
	| 'root' | 'icon'

type TextareaTokens = {
	root:
		| FlattenInputTokens
		| '--textarea-max-rows'
		| '--textarea-min-rows'
		| '--textarea-resize'
}

const tokens = defineTokens<TextareaSpecs>()(args => {
	const { props: { max, min, resizable, rows } } = args
	const sharedTokens = listSharedTokens(args, 'textarea')

	let maxRows, minRows, textAreaResize

	if (typeof resizable === 'boolean') {
		textAreaResize = resizable ? 'vertical' : 'none'

		if (max) {
			if (rows && (rows > max)) maxRows = `${rows}lh`
			else if (min && min > max) maxRows = `${min}lh`
			else maxRows = `${max}lh`
		}

		if (min) {
			if (rows && (rows < min)) minRows = `${min}lh`
			else minRows = `${min}lh`
		}
	}

	const textareaTokens = {
		root: {
			'--textarea-max-rows': maxRows,
			'--textarea-min-rows': minRows,
			'--textarea-resize': textAreaResize,
		},
	}

	return deepMerge(sharedTokens, textareaTokens)
})

export const Textarea = polymorphic<TextareaSpecs>((_props, { useProps, useStyles }) => {
	const { useChosenFieldProps, useFieldCtx } = useField(NAME)

	const context = useFieldCtx(NAME)
	const props = useProps(useChosenFieldProps(_props))
	const styles = useStyles({ context, props, tokens })

	const { aria, clsx, idx } = context

	const {
		disabled, loading, max, min, name,
		onChange, placeholder, readonly,
		required, resizable, rows, size, value,
		...rest
	} = props

	const others = extractOthers(rest)

	return (
		<Box
			{ ...styles('root', clsx) }
			{ ...others }
			as={ TAG }
			attributes={ { aria } }
			disabled={ disabled }
			id={ idx.control }
			name={ name }
			onChange={ onChange }
			placeholder={ placeholder }
			readOnly={ !!readonly || (value !== undefined && !onChange) }
			required={ required }
			rows={ rows }
			value={ value }
		/>
	)
}, { name: NAME, classes })

Textarea.set({
	defaultProps: DEFAULT_PROPS,
	displayName: NAME,
})

export declare namespace Textarea {
	export type Props = TextareaProps
	export type Specs = TextareaSpecs
}
