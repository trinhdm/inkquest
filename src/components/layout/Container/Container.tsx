import { Box, polymorphic, type BoxProps } from '@/components/core/Box'
import { useProps, useStyles, useVariantStyles } from '@/hooks'
import type { ReactNode } from 'react'
import classes from './Container.module.scss'

const NAME = 'Container' as const,
	TAG = 'div' as const

interface ContainerProps extends BoxProps {
	children: ReactNode
	fullWidth?: boolean
}

interface ContainerSpecs {
	default: { component: typeof TAG }
	props: ContainerProps
}

export const Container = polymorphic<ContainerSpecs>(_props => {
	useVariantStyles(NAME)
	const props = useProps(NAME, _props)
	const styles = useStyles<ContainerSpecs>(NAME, { classes, props })

	const {
		as,
		children,
		fullWidth,
		...rest
	} = props

	return (
		<Box
			as={ as }
			attributes={ {
				data: { block: !!fullWidth || null },
			} }
			{ ...styles('root') }
			{ ...rest }
		>
			<Box as="span" { ...styles('inner') }>
				{ children }
			</Box>
		</Box>
	)
}, classes)

Container.displayName = NAME
Container.setDefaults({ props: { as: TAG } })

export declare namespace Container {
	export type Props = ContainerProps
	export type Specs = ContainerSpecs
}
