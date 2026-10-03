import { Globe, Mail, Phone, Search } from 'lucide-react'
import { useFieldCtx, useFieldProps, type Field } from '../Field'
import { extractOthers } from '@/hooks/useProps'
import { polymorphic } from '@/lib/component'
import { Box } from '@/components/polymorphic/Box'
import type { ChangeEventHandler } from 'react'
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
	// error?: string
	// label?: string
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
	context: Field.Context
	defaults: {
		as: typeof TAG
		props: PropsDefaultList<typeof DEFAULT_PROPS>
	}
	props: TextInputProps
	selectors: TextInputSelectors
}

type TextInputSelectors =
	| 'root' | 'icon'

const getInputIcon = ({ type }: TextInputProps) => {
	switch (type) {
		case 'email':	return <Mail />
		case 'search':	return <Search />
		case 'tel':		return <Phone />
		case 'url':		return <Globe />
		default:		return null
	}
}

export const TextInput = polymorphic<TextInputSpecs>((_props, { useProps, useStyles }) => {
	const context = useFieldCtx(NAME)
	const props = useProps(useFieldProps(_props))
	const styles = useStyles({ context, props })

	// const { hasError, idx } = context
	const { idx } = context

	const {
		disabled,
		// error,
		hasError,
		// label,
		loading,
		onChange,
		// placeholder,
		readOnly,
		required,
		size,
		value,
		...rest
	} = props

	const others = extractOthers(rest)
	const icon = getInputIcon(props)

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
		<>
			<div { ...styles('icon') }>{ icon }</div>

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
