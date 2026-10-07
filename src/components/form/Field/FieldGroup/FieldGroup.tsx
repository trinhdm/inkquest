import { extractOthers } from '@/hooks/useProps'
import { polymorphic } from '@/lib/component/factory'
import { FieldGroupProvider, type FieldGroupContext } from './FieldGroup.context'
import { Group, GROUP_CASCADE_PROPS } from '@/components/layout/Group'
import type { Field } from '../Field'
import classes from '../Field.module.scss'

const NAME = 'Field.Group' as const

interface BaseFieldGroupProps {
	legend: string
	required?: Field.Props['required']
}

type FieldGroupProps =
	& BaseFieldGroupProps
	& Group.CompoundProps
	& Field.LayoutProps

interface FieldGroupSpecs {
	isCompound: true
	props: FieldGroupProps
	selectors: FieldGroupSelectors
}

type FieldGroupSelectors =
	| 'root' | 'label' | 'required'

export const FieldGroup = polymorphic<FieldGroupSpecs>((_props, { useProps, useStyles }) => {
	const props = useProps(_props)
	const styles = useStyles({ props })

	const {
		children, labelPosition, layout,
		legend, required, unstyled,
		...rest
	} = props

	const others = extractOthers(rest, GROUP_CASCADE_PROPS)
	const clsx = { global: { eyebrow: true } }

	const header = (
		<legend { ...styles('label') }>
			{ legend }
			{ !!required && <span { ...styles('required') } aria-hidden="true">*</span> }
		</legend>
	)

	return (
		<Group
			{ ...styles('root', clsx) }
			{ ...others }
			as="fieldset"
			childName="Field"
			header={ header }
			provider={ FieldGroupProvider }
			values={ { labelPosition, layout, unstyled } }
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
