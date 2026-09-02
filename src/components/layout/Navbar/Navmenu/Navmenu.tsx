import { Box, polymorphic } from '@/components/core/Box'
import { useProps, useStyles } from '@/hooks'
import { Navitem } from '../Navitem'
import { NavRoute } from '@/utils/constants'
import classes from '../Navbar.module.scss'
import type { NavigationItem } from '@/utils/constants'
// import { useState, type ReactElement, type ReactNode } from 'react'
// import { Button } from '@/components/core'
// import { Icon } from '@/components/core/Icon'

const NAME = 'Navmenu' as const,
	TAG = 'ul' as const

interface NavmenuProps {
	// children: ReactNode
	// items: ReactElement[]
	// onClose?: () => void
	// onToggle?: () => void
	// label: ReactNode

	menu: NavigationItem['menu']
	routes?: NavRoute[]
}

interface NavmenuSpecs {
	// cssVars: { root: NavmenuVars }
	default: { component: typeof TAG }
	props: NavmenuProps
}

export const Navmenu = polymorphic<NavmenuSpecs>(_props => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props })

	const {
		as,
		// children,
		menu,
		// label,
		routes,
		...rest
	} = props

	const hasRoutesToFind = Array.isArray(routes) && !!routes.length

	return (
		<Box
			as={ as }
			role="menubar"
			{ ...styles('root') }
			{ ...rest }
		>
			{ !!menu?.length && menu.filter(
				item => !hasRoutesToFind || (item.route && routes.includes(item.route))
			).map(item => <Navitem key={ `${item.route}` } routes={ routes } { ...item } />) }

			{/* { !!menu?.length && menu.map(item => {
				const hasSpecificRoute = hasRoutesToFind
					? item.route && routes.includes(item.route)
					: true

				if (hasSpecificRoute)
				return <Navitem key={ item.label } { ...item } routes={ routes } />
			}) } */}
		</Box>
	)
}, classes)

Navmenu.displayName = NAME
Navmenu.setDefaults({
	props: {
		as: TAG,
	}
})

export declare namespace Navmenu {
	export type Props = NavmenuProps
	export type Specs = NavmenuSpecs
}
