'use client'

import { useProps, extractOtherProps } from '@/hooks/useProps'
import { useStyles } from '@/hooks/useStyles'
import { filterNavigation, NavRoute } from '@/utils/navigation'
import { polymorphic } from '@/lib/component'
import { Box } from '@/components/polymorphic/Box'
import { Menu } from '../Menu'
import type { ListProps } from '@/lib/component/factory/types'
import classes from './Subnav.module.scss'

const NAME = 'Subnav' as const,
	TAG = 'div' as const

const DEFAULT_PROPS = {
	as: TAG,
} as const

interface SubnavProps {
	routes: NavRoute[]
}

interface SubnavSpecs {
	defaults: {
		as: typeof TAG
		props: ListProps<typeof DEFAULT_PROPS>
	}
	props: SubnavProps
}

export const Subnav = polymorphic<SubnavSpecs>(_props => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props })

	const { routes, ...rest } = props
	const { as, others } = extractOtherProps(rest)

	const navItems = filterNavigation(routes)

	return (
		<Box
			{ ...styles('root') }
			{ ...others }
			as={ as }
		>
			<div { ...styles('wrapper', true) }>
				<div { ...styles('inner') }>
					{ !!navItems.length && (
						<>
							<span { ...styles('label') }>
								{ navItems[0].label }
							</span>
							<Menu
								hasDropdowns={ false }
								items={ navItems }
								{ ...styles('menu') }
							/>
						</>
					) }
				</div>
			</div>
		</Box>
	)
}, classes)

Subnav.displayName = NAME
Subnav.setDefaults({ props: DEFAULT_PROPS })

export declare namespace Subnav {
	export type Props = SubnavProps
	export type Specs = SubnavSpecs
}
