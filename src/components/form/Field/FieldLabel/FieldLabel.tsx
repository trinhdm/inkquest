import { useFieldCtx } from '../Field.context'
import { extractOthers } from '@/hooks/useProps'
import { polymorphic } from '@/lib/component/factory'
import { Box } from '@/components/polymorphic/Box'
import type { ReactNode } from 'react'
import type { Field } from '../Field'
import classes from '../Field.module.scss'

const NAME = 'Field.Label' as const,
	TAG = 'label' as const

interface FieldLabelProps {
	children: ReactNode
}

interface FieldLabelSpecs {
	context: Field.Context
	isCompound: true
	props: FieldLabelProps
	selectors: FieldLabelSelectors
}

type FieldLabelSelectors =
	| 'label' | 'star'

export const FieldLabel = polymorphic<FieldLabelSpecs>((_props, { useProps, useStyles }) => {
	const context = useFieldCtx(NAME)
	const props = useProps(_props)
	const styles = useStyles({ context, props, withRootName: true })

	const { baseName, idx, required } = context
	const { children, ...rest } = props

	const others = extractOthers(rest)

	if (!children) return null

	return (
		<Box
			{ ...styles(baseName) }
			{ ...others }
			as={ TAG }
			htmlFor={ idx.control }
		>
			{ children }
			{ !!required && <span { ...styles('star') } aria-hidden="true">*</span> }
		</Box>
	)
}, { name: NAME, classes })

FieldLabel.set({ displayName: NAME })

export declare namespace FieldLabel {
	export type Props = FieldLabelProps
	export type Specs = FieldLabelSpecs
}
