import { useMemo } from 'react'
import { extractOthers } from '@/hooks/useProps'
import { filterChildren } from '@/lib/component/children'
import { polymorphic } from '@/lib/component/factory'
import { withProvider } from '@/lib/component/context'
import { Box } from '@/components/polymorphic/Box'
import { FieldGroupProvider, type FieldGroupContext } from './FieldGroup.context'
import type { Field } from '../Field'
import classes from '../Field.module.scss'

const NAME = 'Field.Group' as const

interface FieldGroupProps {
	labelPosition?: Field.Props['labelPosition']
	legend: string
	required?: Field.Props['required']
}

interface FieldGroupSpecs {
	isCompound: true
	props: FieldGroupProps
	selectors: FieldGroupSelectors
}

type FieldGroupSelectors =
	| 'root' | 'label' | 'star'

export const FieldGroup = polymorphic<FieldGroupSpecs>((_props, { useProps, useStyles }) => {
	const props = useProps(_props)
	const styles = useStyles({ props })

	const {
		children, labelPosition,
		legend, required, unstyled,
		...rest
	} = props

	const others = extractOthers(rest)

	const items = filterChildren(children, 'Field'),
		total = items.length

	const ctxValues = useMemo(
		() => Array.from({ length: total }, (_, index): FieldGroupContext => ({
			labelPosition, index, unstyled,
		})),
		[labelPosition, total, unstyled]
	)

	return (
		<Box
			{ ...styles('root', { global: { eyebrow: true } }) }
			{ ...others }
			as="fieldset"
		>
			<legend { ...styles('label') }>
				{ legend }
				{ !!required && <span { ...styles('star') } aria-hidden="true">*</span> }
			</legend>

			{ withProvider(items, FieldGroupProvider, ctxValues) }
		</Box>
	)
}, { name: NAME, classes })

FieldGroup.set({ displayName: NAME })

export declare namespace FieldGroup {
	export type Context = FieldGroupContext
	export type Props = FieldGroupProps
	export type Specs = FieldGroupSpecs
}
