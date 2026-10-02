import { useProps, extractOtherProps } from '@/hooks/useProps'
import { useStyles } from '@/hooks/useStyles'
import { polymorphic } from '@/lib/component'
import { Box } from '@/components/polymorphic/Box'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import classes from './Container.module.scss'

const NAME = 'Container' as const,
	TAG = 'section' as const

const DEFAULT_PROPS = {
	as: TAG,
} as const

interface ContainerProps {
	fullWidth?: boolean
}

interface ContainerSpecs {
	defaults: {
		as: typeof TAG
		props: PropsDefaultList<typeof DEFAULT_PROPS>
	}
	props: ContainerProps
}

export const Container = polymorphic<ContainerSpecs>(_props => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props })

	const { as, children, fullWidth, ...rest } = props
	const others = extractOtherProps(rest)
	const global = { block: fullWidth }

	return (
		<Box
			{ ...styles('root', { global }) }
			{ ...others }
			as={ as }
			attributes={ { data: { block: !!fullWidth || null } } }
		>
			<div { ...styles('wrapper', true) }>
				{ children }
			</div>
		</Box>
	)
}, classes)

Container.displayName = NAME
Container.setDefaults({ props: DEFAULT_PROPS })

export declare namespace Container {
	export type Props = ContainerProps
	export type Specs = ContainerSpecs
}
