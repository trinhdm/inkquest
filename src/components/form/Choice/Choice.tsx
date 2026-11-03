import { useField, type Field } from '../Field'
import { extractOthers } from '@/hooks/useProps'
import { polymorphic } from '@/lib/component/factory'
import { Box } from '@/components/polymorphic/Box'
import type { ChangeEventHandler, HTMLInputTypeAttribute, MouseEventHandler } from 'react'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import classes from './Choice.module.scss'

const NAME = 'Choice' as const,
	TAG = 'input' as const

const DEFAULT_PROPS = {
	as: TAG,
	type: 'radio',
} as const

interface BaseChoiceProps {
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
	& Field.ControlProps
	& BaseChoiceProps
	& ChoiceControlProps

interface ChoiceSpecs {
	context: Field.Context
	defaults: {
		as: typeof TAG
		props: PropsDefaultList<typeof DEFAULT_PROPS>
	}
	props: ChoiceProps
	selectors: ChoiceSelectors
}

type ChoiceSelectors =
	| 'root' | 'icon'

export const Choice = polymorphic<ChoiceSpecs>((_props, { useProps, useStyles }) => {
	const { useChosenFieldProps, useFieldCtx } = useField()

	const context = useFieldCtx(NAME)
	const props = useProps(useChosenFieldProps(_props))
	const styles = useStyles({ context, props })

	const {
		aria, clsx, disabled,
		idx, required,
	} = context

	const {
		name, onChange,
		size, type, value,
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
