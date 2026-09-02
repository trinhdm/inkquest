'use client'

import { useProps, useStyles } from '@/hooks'
import { filterNavigation, NavRoute, NAVIGATION_DATA } from '@/utils/navigation'
import { Box, polymorphic } from '@/components/core/Box'
import { Menu } from '../Menu'
import classes from './Subnav.module.scss'

const NAME = 'Subnav' as const,
	TAG = 'div' as const

interface SubnavProps {
	// children: ReactNode
	label: string
	routes: NavRoute[]
}

interface SubnavSpecs {
	default: { component: typeof TAG }
	props: SubnavProps
}

export const Subnav = polymorphic<SubnavSpecs>(_props => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props })

	const {
		as,
		// children,
		label,
		routes,
		...rest
	} = props

	const navItems = filterNavigation(NAVIGATION_DATA, routes)

	return (
		<Box
			as={ as }
			// attributes={ {
			// 	data: { block: !!fullWidth || null },
			// } }
			{ ...styles('root') }
			{ ...rest }
		>
			<Box { ...styles('inner') }>
				<Box { ...styles('label') }>
					{ label }
				</Box>

				{ !!navItems.length && (
					<Menu
						hasDropdowns={ false }
						menu={ navItems }
						routes={ routes }
						{ ...styles('menu') }
					/>
				) }
			</Box>
		</Box>
	)
}, classes)

Subnav.displayName = NAME
Subnav.setDefaults({ props: { as: TAG } })

export declare namespace Subnav {
	export type Props = SubnavProps
	export type Specs = SubnavSpecs
}
