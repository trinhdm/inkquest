import { useChosenFieldProps, useFieldCtx, type Field } from '../Field'
import { defineTokens } from '@/lib/component/tokens'
import { extractOthers } from '@/hooks/useProps'
import { getSharedTokens, type FieldTokens as RadioTokens } from '../utils'
import { polymorphic } from '@/lib/component/factory'
import { Box } from '@/components/polymorphic/Box'
import type { ChangeEventHandler, MouseEventHandler } from 'react'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import classes from './Radio.module.scss'

const NAME = 'Radio' as const
const DEFAULT_PROPS = {
} as const

interface BaseRadioProps
	extends Field.SharedProps {
	name: string
	onClick?: MouseEventHandler<HTMLInputElement>
	value: string
}

interface ControlledRadioProps {
	checked?: boolean
	onChange?: ChangeEventHandler<HTMLInputElement>
}

interface UncontrolledRadioProps {
	checked?: never
	onChange?: never
}

type RadioControlProps =
	| ControlledRadioProps
	| UncontrolledRadioProps

type RadioProps =
	& BaseRadioProps
	& RadioControlProps

interface RadioSpecs {
	context: Field.Context
	defaults: { props: PropsDefaultList<typeof DEFAULT_PROPS> }
	props: RadioProps
	selectors: RadioSelectors
	tokens: RadioTokens
}

type RadioSelectors =
	| 'root'

const tokens = defineTokens<RadioSpecs>()(args => getSharedTokens(args))

export const Radio = polymorphic<RadioSpecs>((_props, { useProps, useStyles }) => {
	const context = useFieldCtx(NAME)
	const props = useProps(useChosenFieldProps(_props))
	const styles = useStyles({ context, props, tokens })

	const { aria, clsx, idx } = context

	const {
		disabled, loading, name,
		onChange,
		required, size, value,
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
			type="radio"
			value={ value }
		/>
	)
}, { name: NAME, classes })

Radio.set({
	defaultProps: DEFAULT_PROPS,
	displayName: NAME,
})

export declare namespace Radio {
	export type Props = RadioProps
	export type Specs = RadioSpecs
}
