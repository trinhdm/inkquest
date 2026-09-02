'use client'

import { useProps, useStyles } from '@/hooks'
import { Box, polymorphic } from '@/components/core/Box'
import { Button } from '@/components/core'
import { Navmenu } from './Navmenu'
import { Navitem } from './Navitem'
import { NAVIGATION_DATA, NavRoute, type NavigationItem } from '@/utils/constants'
import classes from './Navbar.module.scss'

const NAME = 'Navbar' as const,
	DEFAULT_TAG = 'nav' as const

interface NavbarProps {
	routes?: NavRoute[]
}

interface NavbarSpecs {
	default: { component: typeof DEFAULT_TAG }
	props: NavbarProps
	subcomponents: {
		Menu: typeof Navmenu
		Item: typeof Navitem
	}
}

export const filterNavigation = (
	items: NavigationItem[],
	routes?: NavRoute[]
): NavigationItem[] => {
	if (!routes?.length) return items

	return items.reduce<NavigationItem[]>((acc, item) => {
		if (item.route && routes.includes(item.route)) {
			const menu = item.menu && filterNavigation(item.menu, routes)
			acc.push({ ...item, menu: menu?.length ? menu : undefined })
		}

		return acc
	}, [])
}

export const Navbar = polymorphic<NavbarSpecs>(_props => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props })
	const { as, routes, ...rest } = props

	const navItems = filterNavigation(NAVIGATION_DATA, routes)


	return (
		<Box
			as="nav"
			// attributes={ {
			// 	data: { block: !!fullWidth || null },
			// } }
			role="navigation"
			{ ...styles('root') }
			{ ...rest }
		>
			<Box as="div" { ...styles('inner') }>
				<Box as="div" { ...styles('col') }>
					logo
				</Box>

				{ !!navItems.length && (
					<Navmenu menu={ navItems } routes={ routes } />
				) }

				<Box as="div" { ...styles('col') }>
					<Button.Group hasPriority={ false }>
						<Button variant="ghost">Log in</Button>
						<Button>Sign up</Button>
					</Button.Group>
				</Box>
			</Box>
		</Box>
	)
}, classes)

Navbar.displayName = NAME
Navbar.setDefaults({ props: { as: DEFAULT_TAG } })

export declare namespace Navbar {
	export type Props = NavbarProps
	export type Specs = NavbarSpecs

	export namespace Menu {
		export type Props = typeof Navmenu.Props
		export type Specs = typeof Navmenu.Specs
	}

	export namespace Item {
		export type Props = typeof Navitem.Props
		export type Specs = typeof Navitem.Specs
	}
}
