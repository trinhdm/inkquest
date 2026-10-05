import { useChosenFieldProps, useFieldCtx, type Field } from '../Field'
import { extractOthers } from '@/hooks/useProps'
import { defineTokens, polymorphic } from '@/lib/component'
import { Box } from '@/components/polymorphic/Box'
import type { ChangeEventHandler, ComponentPropsWithoutRef } from 'react'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import type { Size } from '@/types/shared'
import classes from './TextInput.module.scss'

const NAME = 'TextInput' as const,
	TAG = 'input' as const

const DEFAULT_PROPS = {
	as: TAG,
	required: false,
	type: 'text',
} as const

interface TextInputProps {
	disabled?: boolean
	loading?: boolean
	name?: string
	onChange?: ChangeEventHandler<HTMLInputElement>
	placeholder?: string
	readOnly?: boolean
	required?: boolean
	size?: Size
	type?: ComponentPropsWithoutRef<'input'>['type']
	value?: string
}

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
	| 'root'

type TextInputTokens = {
	root:
		| '--input-control-padding'
}

const tokens = defineTokens<TextInputSpecs>()(({ context, props, theme }) => {
	const { hasIcon } = context
	const { size } = props

	const step = hasIcon ? 2 : 1.5
	const blockPadding = !!size ? theme.el.field.padding(size) : 'var(--field-control-padding)',
		inlinePadding = `calc(${step} * ${blockPadding})`,
		padding = `${blockPadding} ${inlinePadding}`

	const iconMargin = size === 'sm' ? `calc(1.5 * ${inlinePadding})` : inlinePadding,
		leftPadding = `calc(${iconMargin} + var(--field-icon-size))`

	return {
		root: {
			'--input-control-padding': hasIcon
				? `${padding} ${blockPadding} ${leftPadding}`
				: padding,
		},
	}
})

export const TextInput = polymorphic<TextInputSpecs>((_props, { useProps, useStyles }) => {
	const context = useFieldCtx(NAME)
	const props = useProps(useChosenFieldProps(_props))
	const styles = useStyles({ context, props, tokens })

	const { hasError, idx } = context

	const {
		disabled,
		loading,
		onChange,
		readOnly,
		required,
		size,
		value,
		...rest
	} = props

	const others = extractOthers(rest)

	const aria = {
		busy: !!loading || undefined,
		describedby: idx.error,
		invalid: hasError || undefined,
		required: !!required || undefined,
	}

	const data = {
		// disabled: !!disabled || null,
		// invalid: hasError || null,
		loading: !!loading || null,
		// required: !!required || null,
	}

	return (
		<Box
			{ ...styles('root') }
			{ ...others }
			as={ TAG }
			attributes={ { aria, data } }
			disabled={ disabled }
			id={ idx.control }
			onChange={ onChange }
			readOnly={ readOnly || !!loading || (value !== undefined && !onChange) }
			value={ value }
		/>
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
