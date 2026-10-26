import { useId } from 'react'
import { useFormCtx, type Form } from '../../Form'
import { extractOthers } from '@/hooks/useProps'
import { getFormErrors } from '../../utils'
import { polymorphic } from '@/lib/component/factory'
import { toKebabCase } from '@/utils/helpers'
import { FieldGroupProvider, type FieldGroupContext } from './FieldGroup.context'
import { Group, GROUP_CASCADE_PROPS } from '@/components/layout/Group'
import type { Field } from '../Field'
import classes from '../Field.module.scss'

const NAME = 'Field.Group' as const

interface BaseFieldGroupProps {
	disabled?: Field.Props['disabled']
	legend: string
	name?: string
	required?: Field.Props['required']
	type?: Field.Props['type']
}

type FieldGroupProps =
	& BaseFieldGroupProps
	& Group.CompoundProps
	& Field.LayoutProps

interface FieldGroupSpecs {
	context: Form.Context
	isCompound: true
	props: FieldGroupProps
	selectors: FieldGroupSelectors
}

type FieldGroupSelectors =
	| 'root' | 'label'
	| 'required' | 'error'

export const FieldGroup = polymorphic<FieldGroupSpecs>((_props, { useProps, useStyles }) => {
	const context = { form: useFormCtx() }
	const props = useProps(_props)
	const styles = useStyles({ props })

	const {
		children, disabled, labelPosition,
		layout, legend, name,
		required, type, unstyled,
		...rest
	} = props

	const others = extractOthers(rest, GROUP_CASCADE_PROPS)

	const uid = useId(),
		errorID = `${toKebabCase(uid)}-error`

	const { error, hasError, isInvalid } = getFormErrors({ context, name, props })

	const errorEl = hasError && <span { ...styles('error') } id={ errorID }>{ error }</span>
	const labelEl = (
		<legend { ...styles('label') }>
			{ legend }
			{ !!required && <span { ...styles('required') } aria-hidden="true">*</span> }
		</legend>
	)

	return (
		<Group
			{ ...styles('root') }
			{ ...others }
			as="fieldset"
			attributes={ { aria: {
				describedby: hasError ? errorID : undefined,
			} } }
			childName="Field"
			header={ <>{ labelEl }{ errorEl }</> }
			provider={ FieldGroupProvider }
			values={ {
				disabled, invalid: isInvalid,
				labelPosition, layout,
				required, type, unstyled,
			} }
		>
			{ children }
		</Group>
	)
}, { name: NAME, classes })

FieldGroup.set({ displayName: NAME })

export declare namespace FieldGroup {
	export type Context = FieldGroupContext
	export type Props = FieldGroupProps
	export type Specs = FieldGroupSpecs
}
