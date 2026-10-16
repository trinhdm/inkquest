import { useField, type Field } from '../Field'
import { deepMerge } from '@/utils/helpers'
import { defineTokens } from '@/lib/component/tokens'
import { extractOthers } from '@/hooks/useProps'
import { listSharedTokens, type FlattenFieldTokens } from '../utils'
import { polymorphic } from '@/lib/component/factory'
import { Box } from '@/components/polymorphic/Box'
import type { ChangeEventHandler } from 'react'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import classes from './TextArea.module.scss'

const NAME = 'TextArea' as const

const DEFAULT_PROPS = {
	resizable: true,
	rows: 4,
	max: 8,
	min: 3,
} as const

interface BaseTextAreaProps {
	name: string
	onChange?: ChangeEventHandler<HTMLTextAreaElement>
	placeholder?: string
	readOnly?: boolean
	rows?: number
	value?: string
}

interface StaticTextAreaProps {
	max?: never
	min?: never
	resizable?: false | never
}

interface DynamicTextAreaProps {
	max?: number
	min?: number
	resizable: true
}

type SizableTextAreaProps =
	| DynamicTextAreaProps
	| StaticTextAreaProps

type TextAreaProps =
	& Field.SharedProps
	& BaseTextAreaProps
	& SizableTextAreaProps

interface TextAreaSpecs {
	context: Field.Context
	defaults: { props: PropsDefaultList<typeof DEFAULT_PROPS> }
	props: TextAreaProps
	selectors: TextAreaSelectors
	tokens: TextAreaTokens
}

type TextAreaSelectors =
	| 'root' | 'icon'

type TextAreaTokens = {
	root:
		| FlattenFieldTokens
		| '--textarea-max-rows'
		| '--textarea-min-rows'
		| '--textarea-resize'
}

const tokens = defineTokens<TextAreaSpecs>()(args => {
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

export const TextArea = polymorphic<TextAreaSpecs>((_props, { useProps, useStyles }) => {
	const { useChosenFieldProps, useFieldCtx } = useField()

	const context = useFieldCtx(NAME)
	const props = useProps(useChosenFieldProps(_props))
	const styles = useStyles({ context, props, tokens })

	const { aria, clsx, idx } = context

	const {
		disabled, loading, max, min, name,
		onChange, placeholder, readOnly,
		required, resizable, rows, size, value,
		...rest
	} = props

	const others = extractOthers(rest)

	return (
		<Box
			{ ...styles('root', clsx) }
			{ ...others }
			as="textarea"
			attributes={ { aria } }
			disabled={ disabled }
			id={ idx.control }
			name={ name }
			onChange={ onChange }
			placeholder={ placeholder }
			readOnly={ readOnly || (value !== undefined && !onChange) }
			required={ required }
			rows={ rows }
			value={ value }
		/>
	)
}, { name: NAME, classes })

TextArea.set({
	defaultProps: DEFAULT_PROPS,
	displayName: NAME,
})

export declare namespace TextArea {
	export type Props = TextAreaProps
	export type Specs = TextAreaSpecs
}
