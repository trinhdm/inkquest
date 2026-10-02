import { useProps, extractOtherProps } from '@/hooks/useProps'
import { useStyles } from '@/hooks/useStyles'
import { polymorphic } from '@/lib/component'
import { Box } from '@/components/polymorphic/Box'
import type { ChangeEventHandler } from 'react'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import type { Size } from '@/types/shared'
import classes from './TextInput.module.scss'

const NAME = 'TextInput' as const
const DEFAULT_PROPS = {
	required: false,
	type: 'text',
} as const

interface TextInputProps {
	disabled?: boolean
	error?: string
	label?: string
	loading?: boolean
	name?: string
	onChange?: ChangeEventHandler<HTMLInputElement>
	placeholder?: string
	readOnly?: boolean
	required?: boolean
	size?: Size
	type?: TextInputType
	value?: string
}

type TextInputType =
	| 'email'
	| 'password'
	| 'search'
	| 'tel'
	| 'text'
	| 'url'

interface TextInputSpecs {
	defaults: { props: PropsDefaultList<typeof DEFAULT_PROPS> }
	props: TextInputProps
}

export const TextInput = polymorphic<TextInputSpecs>(_props => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props })

	const {
		disabled,
		error,
		label,
		loading,
		onChange,
		// placeholder,
		readOnly,
		required,
		size,
		value,
		...rest
	} = props

	const { others } = extractOtherProps(rest)

	const hasError = !!error?.trim()

	const data = {
		disabled: !!disabled || null,
		invalid: hasError || null,
		loading: !!loading || null,
		required: !!required || null,
	}

	const aria = {
		// describedby: hasError ? errorID : undefined,
		invalid: hasError || undefined,
	}

	return (
		<Box
			{ ...styles('root') }
			{ ...others }
			as="input"
			attributes={ { aria, data } }
			onChange={ onChange }
			readOnly={ readOnly || (value !== undefined && !onChange) }
			value={ value }
		>

		</Box>
	)
}, classes)

TextInput.displayName = NAME
TextInput.setDefaults({ props: DEFAULT_PROPS })

export declare namespace TextInput {
	export type Props = TextInputProps
	export type Specs = TextInputSpecs
}
