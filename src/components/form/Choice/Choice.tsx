import { useField, type Field } from '../Field'
import { extractOthers } from '@/hooks/useProps'
import { getSharedTokens, type FieldTokens as ChoiceTokens } from '../utils'
import { polymorphic } from '@/lib/component/factory'
import { Box } from '@/components/polymorphic/Box'
import type { ChangeEventHandler, HTMLInputTypeAttribute, MouseEventHandler } from 'react'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import classes from './Choice.module.scss'

const NAME = 'Choice' as const

const DEFAULT_PROPS = {
	type: 'radio',
} as const

interface BaseChoiceProps
	extends Field.SharedProps {
	name: string
	onClick?: MouseEventHandler<HTMLInputElement>
	type?: Extract<HTMLInputTypeAttribute, Choice.Types>
	value: string
}

interface ControlledChoiceProps {
	checked?: boolean
	onChange?: ChangeEventHandler<HTMLInputElement>
}

interface UncontrolledChoiceProps {
	checked?: never
	onChange?: never
}

type ChoiceControlProps =
	| ControlledChoiceProps
	| UncontrolledChoiceProps

type ChoiceProps =
	& BaseChoiceProps
	& ChoiceControlProps

interface ChoiceSpecs {
	context: Field.Context
	defaults: { props: PropsDefaultList<typeof DEFAULT_PROPS> }
	props: ChoiceProps
	selectors: ChoiceSelectors
	tokens: ChoiceTokens
}

type ChoiceSelectors =
	| 'root' | 'icon'

const tokens = getSharedTokens('choice')

export const Choice = polymorphic<ChoiceSpecs>((_props, { useProps, useStyles }) => {
	const { useChosenFieldProps, useFieldCtx } = useField()

	const context = useFieldCtx(NAME)
	const props = useProps(useChosenFieldProps(_props))
	const styles = useStyles({ context, props, tokens })

	const { aria, clsx, idx } = context

	const {
		disabled, loading, name,
		onChange, required, size,
		type, value,
		...rest
	} = props

	const others = extractOthers(rest)

	return (
		<Box
			{ ...styles('root', clsx) }
			{ ...others }
			as="input"
			attributes={ { aria } }
			disabled={ disabled }
			id={ idx.control }
			name={ name }
			onChange={ onChange }
			required={ required }
			type={ type }
			value={ value }
		/>
	)
}, { name: NAME, classes })

Choice.set({
	defaultProps: DEFAULT_PROPS,
	displayName: NAME,
})

export declare namespace Choice {
	export type Props = ChoiceProps
	export type Specs = ChoiceSpecs
	export type Types = 'checkbox' | 'radio'
}
