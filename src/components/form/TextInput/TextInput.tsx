import { useChosenFieldProps, useFieldCtx, type Field } from '../Field'
import { defineTokens } from '@/lib/component/tokens'
import { extractOthers } from '@/hooks/useProps'
import { getSharedTokens, type FieldTokens as TextInputTokens } from '../utils'
import { polymorphic } from '@/lib/component/factory'
import { Box } from '@/components/polymorphic/Box'
import type { ChangeEventHandler, HTMLInputTypeAttribute, MouseEventHandler } from 'react'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import classes from './TextInput.module.scss'
import { Eye } from 'lucide-react'

const NAME = 'TextInput' as const
const DEFAULT_PROPS = {
	required: false,
	type: 'text',
} as const

interface BaseTextInputProps {
	name: string
	onChange?: ChangeEventHandler<HTMLInputElement>
	placeholder?: string
	readOnly?: boolean
	value?: string
}

interface InputTypeTextProps {
	iconPosition?: never
	onIconClick?: never
	type?: Extract<Extract<HTMLInputTypeAttribute, TextInput.Types>, 'text'>
}

interface InputTypeOthersProps {
	iconPosition?: 'left' | 'right'
	onIconClick?: MouseEventHandler<HTMLSpanElement>
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
	defaults: { props: PropsDefaultList<typeof DEFAULT_PROPS> }
	props: TextInputProps
	selectors: TextInputSelectors
	tokens: TextInputTokens
}

type TextInputSelectors =
	| 'root' | 'icon'

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
		disabled, loading, iconPosition,
		name, onChange, onIconClick,
		placeholder, readOnly, required,
		size, type, value,
		...rest
	} = props

	const others = extractOthers(rest)

	return (
		<>
			{ icon && (
				<span { ...styles('icon') } onClick={ onIconClick }>
					{ type === 'password' ? <Eye /> : icon }
				</span>
			) }

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
	export type Types = 'email' | 'number' | 'password' | 'search' | 'tel' | 'text' | 'url'
}
