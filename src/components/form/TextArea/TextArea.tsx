import { extractOthers } from '@/hooks/useProps'
import { polymorphic } from '@/lib/component/factory'
import { Box } from '@/components/polymorphic/Box'
import { useChosenFieldProps, useFieldCtx, type Field } from '../Field'
import type { ChangeEventHandler } from 'react'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import classes from './TextArea.module.scss'

const NAME = 'TextArea' as const,
	TAG = 'textarea' as const

const DEFAULT_PROPS = {
	rows: 4,
} as const

interface TextAreaProps
	extends Field.SharedProps {
	name?: string
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
}

type TextAreaSelectors =
	| 'root'

export const TextArea = polymorphic<TextAreaSpecs>((_props, { useProps, useStyles }) => {
	const context = useFieldCtx(NAME)
	const props = useProps(useChosenFieldProps(_props))
	const styles = useStyles({ context, props })

	const { aria, clsx, idx } = context

	const {
		disabled, loading, name,
		onChange, placeholder, readOnly,
		required, size, value,
		...rest
	} = props

	const others = extractOthers(rest)

	return (
		<Box
			{ ...styles('root', clsx) }
			{ ...others }
			as={ TAG }
			attributes={ { aria } }
			disabled={ disabled }
			id={ idx.control }
			name={ name }
			onChange={ onChange }
			placeholder={ placeholder }
			readOnly={ readOnly || (value !== undefined && !onChange) }
			required={ required }
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
