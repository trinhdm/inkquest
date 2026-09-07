'use client'

import { useProps, useStyles } from '@/hooks'
import { filterNavigation, NavRoute } from '@/utils/navigation'
import { Box, polymorphic } from '@/components/core/Box'
import { Menu } from '../Menu'
import classes from './Subnav.module.scss'

const NAME = 'Subnav' as const,
	TAG = 'div' as const

interface SubnavProps {
	routes: NavRoute[]
}

interface SubnavSpecs {
	default: { component: typeof TAG }
	props: SubnavProps
}

export const Subnav = polymorphic<SubnavSpecs>(_props => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props })

	const { as, routes, ...rest } = props
	const navItems = filterNavigation(routes)

	return (
		<Box
			as={ as }
			// attributes={ {
			// 	data: { block: !!fullWidth || null },
			// } }
			{ ...styles('root') }
			{ ...rest }
		>
			<Box { ...styles('wrapper') }>
				<Box { ...styles('inner') }>
					{ !!navItems.length && (
						<>
							<Box as="span" { ...styles('label') }>
								{ navItems[0].label }
							</Box>
							<Menu
								hasDropdowns={ false }
								items={ navItems }
								routes={ routes }
								{ ...styles('menu') }
							/>
						</>
					) }
				</Box>
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
