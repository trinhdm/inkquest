import { extractOthers } from '@/hooks/useProps'
import { filterChildren } from '@/lib/component/children'
import { polymorphic } from '@/lib/component/factory'
import { Box } from '@/components/polymorphic/Box'
import type { Field } from '../Field'
import classes from '../Field.module.scss'

const NAME = 'Field.Group' as const

interface FieldGroupProps {
	legend: string
}

interface FieldGroupSpecs {
	context: Field.Context
	isCompound: true
	props: FieldGroupProps
	selectors: FieldGroupSelectors
}

type FieldGroupSelectors =
	| 'root' | 'legend'

export const FieldGroup = polymorphic<FieldGroupSpecs>((_props, { useProps, useStyles }) => {
	const props = useProps(_props)
	const styles = useStyles({ props })

	const { children, legend, ...rest } = props
	const others = extractOthers(rest)

	return (
		<Box
			{ ...styles('root', { global: { eyebrow: true } }) }
			{ ...others }
			as="fieldset"
		>
			<legend { ...styles('legend') }>{ legend }</legend>
			{ filterChildren(children, 'Field').map(child => child) }
		</Box>
	)
}, { name: NAME, classes })

FieldGroup.set({ displayName: NAME })

export declare namespace FieldGroup {
	export type Props = FieldGroupProps
	export type Specs = FieldGroupSpecs
}
