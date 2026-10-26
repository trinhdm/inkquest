import { Eye } from 'lucide-react'
import { useField, type Field } from '../Field'
import { extractOthers } from '@/hooks/useProps'
import { getSharedTokens, type FieldTokens as TextInputTokens } from '../utils'
import { polymorphic } from '@/lib/component/factory'
import { Box } from '@/components/polymorphic/Box'
import type { ChangeEventHandler, HTMLInputTypeAttribute, MouseEventHandler } from 'react'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import classes from './TextInput.module.scss'

const NAME = 'TextInput' as const,
	TAG = 'input' as const

const DEFAULT_PROPS = {
	as: TAG,
	required: false,
	type: 'text',
} as const

interface BaseTextInputProps {
	name: string
	onChange?: ChangeEventHandler<HTMLInputElement>
	placeholder?: string
	readonly?: boolean
	value?: string
}

interface InputTypeTextProps {
	iconPosition?: never
	type?: Extract<Extract<HTMLInputTypeAttribute, TextInput.Types>, 'text'>
}

interface InputTypeOthersProps {
	iconPosition?: 'left' | 'right'
	type: Exclude<Extract<HTMLInputTypeAttribute, TextInput.Types>, 'text'>
}

type TextInputTypeProps =
	| InputTypeOthersProps
	| InputTypeTextProps

type TextInputProps =
	& BaseTextInputProps
	& Field.SharedProps
	& TextInputTypeProps

interface TextInputSpecs {
	context: Field.Context
	defaults: {
		as: typeof TAG
		props: PropsDefaultList<typeof DEFAULT_PROPS>
	}
	props: TextInputProps
	selectors: TextInputSelectors
	tokens: TextInputTokens
}

type TextInputSelectors =
	| 'root' | 'icon'

const tokens = getSharedTokens('input')

export const TextInput = polymorphic<TextInputSpecs>((_props, { useProps, useStyles }) => {
	const { useChosenFieldProps, useFieldCtx } = useField()

	const context = useFieldCtx(NAME)
	const props = useProps(useChosenFieldProps(_props))
	const styles = useStyles({ context, props, tokens })

	const {
		aria, clsx, icon,
		idx, layout, loader,
	} = context

	const {
		disabled, loading, iconPosition,
		name, onChange,
		placeholder, readonly, required,
		size, type, value,
		...rest
	} = props

	const others = extractOthers(rest)

	return (
		<>
			{ (icon && layout !== 'inline') && (
				<span { ...styles('icon') }>
					{ type === 'password' ? <Eye aria-hidden /> : icon }
				</span>
			) }

			<Box
				{ ...styles('root', clsx) }
				{ ...others }
				as={ TAG }
				attributes={ { aria } }
				disabled={ !!disabled }
				id={ idx.control }
				name={ name }
				onChange={ onChange }
				placeholder={ placeholder }
				readOnly={ !!readonly || (value !== undefined && !onChange) }
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
	export type Types = 'email' | 'number' | 'password' | 'search' | 'tel' | 'text' | 'url'
}
