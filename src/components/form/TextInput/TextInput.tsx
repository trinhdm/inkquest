import { useState, type ChangeEventHandler, type HTMLInputTypeAttribute } from 'react'
import { Eye, EyeClosed } from 'lucide-react'
import { useField, type Field } from '../Field'
import { extractOthers } from '@/hooks/useProps'
import { getSharedTokens, type InputTokens as TextInputTokens } from '../utils'
import { polymorphic } from '@/lib/component/factory'
import { Box } from '@/components/polymorphic/Box'
import { Button } from '@/components/core/Button'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import classes from './TextInput.module.scss'

const NAME = 'TextInput' as const,
	TAG = 'input' as const

const DEFAULT_PROPS = {
	as: TAG,
	type: 'text',
} as const

interface BaseTextInputProps {
	name: string
	onChange?: ChangeEventHandler<HTMLInputElement>
	placeholder?: string
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
	& Field.ControlProps
	& BaseTextInputProps
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
	| 'toggle' | 'glyph'

const tokens = getSharedTokens('input')

export const TextInput = polymorphic<TextInputSpecs>((_props, { useProps, useStyles }) => {
	const [shown, setShown] = useState(false)

	const { useChosenFieldProps, useFieldCtx } = useField()

	const context = useFieldCtx(NAME)
	const props = useProps(useChosenFieldProps(_props))
	const styles = useStyles({ context, props, tokens })

	const {
		aria, clsx, disabled,
		icon, idx, layout,
		loader, readonly, required,
	} = context

	const {
		iconPosition, name,
		onChange, placeholder,
		size, type, value,
		...rest
	} = props

	const others = extractOthers(rest)

	const isPassword = type === 'password',
		hasIcon = !!(icon || isPassword) && layout !== 'inline',
		inputType = isPassword && shown ? 'text' : type

	const handleShown = () => { setShown(prev => !prev) }

	return (
		<>
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
				type={ inputType }
				value={ value }
			/>

			{ hasIcon && (
				<span { ...styles('icon') }>
					{ isPassword ? (
						<Button
							{ ...styles('toggle', { selector: { shown } }) }
							unstyled
							attributes={ { aria: {
								controls: idx.control,
								label: `${shown ? 'Hide' : 'Show'} password`,
								pressed: shown,
							} } }
							disabled={ !!disabled }
							onClick={ handleShown }
							role="switch"
						>
							<Eye { ...styles('glyph', { selector: 'open' }) } />
							<EyeClosed { ...styles('glyph', { selector: 'closed' }) } />
						</Button>
					) : icon }
				</span>
			) }

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
