import { useField, type Field } from '../Field'
import { extractOthers } from '@/hooks/useProps'
import { getSharedTokens, type InputTokens as NumberInputTokens } from '../utils'
import { polymorphic } from '@/lib/component/factory'
import { Box } from '@/components/polymorphic/Box'
import type { ChangeEventHandler, HTMLInputTypeAttribute } from 'react'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import classes from './NumberInput.module.scss'

const NAME = 'NumberInput' as const,
	TAG = 'input' as const

const DEFAULT_PROPS = {
	as: TAG,
	maxLength: 1,
	type: 'text',
} as const

interface BaseNumberInputProps {
	name: string
	onChange?: ChangeEventHandler<HTMLInputElement>
	placeholder?: string
	value?: string
}

interface InputDigitProps {
	iconPosition?: never
	inputmode: 'numeric' | 'tel'
	maxLength?: number
	type: Extract<HTMLInputTypeAttribute, 'text'>
}

interface InputTypeOthersProps {
	iconPosition?: 'left' | 'right'
	inputmode?: never
	maxLength?: never
	type: Extract<HTMLInputTypeAttribute, 'number' | 'tel'>
}

type NumberInputTypeProps =
	| InputTypeOthersProps
	| InputDigitProps

type NumberInputProps =
	& Field.ControlProps
	& BaseNumberInputProps
	& NumberInputTypeProps

interface NumberInputSpecs {
	context: Field.Context
	defaults: {
		as: typeof TAG
		props: PropsDefaultList<typeof DEFAULT_PROPS>
	}
	props: NumberInputProps
	selectors: NumberInputSelectors
	tokens: NumberInputTokens
}

type NumberInputSelectors =
	| 'root' | 'icon'

const tokens = getSharedTokens('number')

export const NumberInput = polymorphic<NumberInputSpecs>((_props, { useProps, useStyles }) => {
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
		iconPosition, inputmode, maxLength,
		name, onChange, placeholder,
		size, type, value,
		...rest
	} = props

	const others = extractOthers(rest)

	return (
		<>
			{ (icon && !!inputmode && layout !== 'inline') && (
				<span { ...styles('icon') }>
					{ icon }
				</span>
			) }

			<Box
				{ ...styles('root', clsx) }
				{ ...others }
				as="input"
				attributes={ { aria } }
				disabled={ !!disabled }
				id={ idx.control }
				inputMode={ inputmode }
				maxLength={ maxLength }
				name={ name }
				onChange={ onChange }
				placeholder={ placeholder }
				readOnly={ !!readonly || (value !== undefined && !onChange) }
				required={ required }
				type={ type }
				value={ value }
			/>

			{ !!inputmode && loader }
		</>
	)
}, { name: NAME, classes })

NumberInput.set({
	defaultProps: DEFAULT_PROPS,
	displayName: NAME,
})

export declare namespace NumberInput {
	export type Props = NumberInputProps
	export type Specs = NumberInputSpecs
}
