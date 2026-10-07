import { useChosenFieldProps, useFieldCtx, type Field } from '../Field'
import { defineTokens } from '@/lib/component/tokens'
import { extractOthers } from '@/hooks/useProps'
import { getSharedTokens, type FieldTokens as TextAreaTokens } from '../utils'
import { polymorphic } from '@/lib/component/factory'
import { Box } from '@/components/polymorphic/Box'
import type { ChangeEventHandler } from 'react'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import classes from './TextArea.module.scss'

const NAME = 'TextArea' as const
const DEFAULT_PROPS = {
	rows: 4,
} as const

interface TextAreaProps
	extends Field.SharedProps {
	name: string
	onChange?: ChangeEventHandler<HTMLTextAreaElement>
	placeholder?: string
	readOnly?: boolean
	rows?: number
	value?: string
}

interface TextAreaSpecs {
	context: Field.Context
	defaults: { props: PropsDefaultList<typeof DEFAULT_PROPS> }
	props: TextAreaProps
	selectors: TextAreaSelectors
	tokens: TextAreaTokens
}

type TextAreaSelectors =
	| 'root' | 'icon'

const tokens = defineTokens<TextAreaSpecs>()(args => getSharedTokens(args))

export const TextArea = polymorphic<TextAreaSpecs>((_props, { useProps, useStyles }) => {
	const context = useFieldCtx(NAME)
	const props = useProps(useChosenFieldProps(_props))
	const styles = useStyles({ context, props, tokens })

	const { aria, clsx, idx } = context

	const {
		disabled, loading, name,
		onChange, placeholder, readOnly,
		required, rows, size, value,
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
