import { useChosenFieldProps, useFieldCtx, type Field } from '../Field'
import { defineTokens } from '@/lib/component/tokens'
import { extractOthers } from '@/hooks/useProps'
import { getSharedTokens, type FieldTokens as TextInputTokens } from '../utils'
import { polymorphic } from '@/lib/component/factory'
import { Box } from '@/components/polymorphic/Box'
import type { ChangeEventHandler, HTMLInputTypeAttribute } from 'react'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import classes from './TextInput.module.scss'

const NAME = 'TextInput' as const
const DEFAULT_PROPS = {
	required: false,
	type: 'text',
} as const

interface TextInputProps
	extends Field.SharedProps {
	name: string
	onChange?: ChangeEventHandler<HTMLInputElement>
	placeholder?: string
	readOnly?: boolean
	type?: Extract<HTMLInputTypeAttribute, 'email' | 'number' | 'search' | 'tel' | 'text' | 'url'>
	value?: string
}
interface TextInputSpecs {
	context: Field.Context
	defaults: { props: PropsDefaultList<typeof DEFAULT_PROPS> }
	props: TextInputProps
	selectors: TextInputSelectors
	tokens: TextInputTokens
}

type TextInputSelectors =
	| 'root'

const tokens = defineTokens<TextInputSpecs>()(args => getSharedTokens(args))

export const TextInput = polymorphic<TextInputSpecs>((_props, { useProps, useStyles }) => {
	const context = useFieldCtx(NAME)
	const props = useProps(useChosenFieldProps(_props))
	const styles = useStyles({ context, props, tokens })

	const {
		aria, clsx, icon,
		idx, loader,
	} = context

	const {
		disabled, loading, name, onChange,
		placeholder, readOnly, required,
		size, type, value,
		...rest
	} = props

	const others = extractOthers(rest)

	return (
		<>
			{ icon }
			<Box
				{ ...styles('root', clsx) }
				{ ...others }
				as="input"
				attributes={ { aria } }
				disabled={ disabled }
				id={ idx.control }
				name={ name }
				onChange={ onChange }
				placeholder={ placeholder }
				readOnly={ readOnly || (value !== undefined && !onChange) }
				required={ required }
				type={ type }
				value={ value }
			/>
			{ loader }
		</>
	)
}, { name: NAME, classes })

TextInput.set({
	defaultProps: DEFAULT_PROPS,
	displayName: NAME,
})

export declare namespace TextInput {
	export type Props = TextInputProps
	export type Specs = TextInputSpecs
}
