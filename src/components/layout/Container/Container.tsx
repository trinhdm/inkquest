import { useProps, useStyles } from '@/hooks'
import { extractOtherProps } from '@/utils/helpers'
import { Box, polymorphic } from '@/components/core/Box'
import type { ReactNode } from 'react'
import classes from './Container.module.scss'

const NAME = 'Container' as const,
	DEFAULT_TAG = 'section' as const

interface ContainerProps {
	children: ReactNode
	fullWidth?: boolean
}

interface ContainerSpecs {
	default: { component: typeof DEFAULT_TAG }
	props: ContainerProps
}

export const Container = polymorphic<ContainerSpecs>(_props => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props })

	const { children, fullWidth, ...rest } = props
	const { as, others } = extractOtherProps(rest)

	return (
		<Box
			as={ as }
			attributes={ {
				data: { block: !!fullWidth || null },
			} }
			{ ...styles('root') }
			{ ...others }
		>
			<div { ...styles('wrapper') }>
				<div { ...styles('inner') }>
					{ children }
				</div>
			</div>
		</Box>
	)
}, classes)

Container.displayName = NAME
Container.setDefaults({ props: { as: DEFAULT_TAG } })

export declare namespace Container {
	export type Props = ContainerProps
	export type Specs = ContainerSpecs
}
