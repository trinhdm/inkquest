'use client'

import { useProps, useStyles } from '@/hooks'
import { Box, polymorphic } from '@/components/core/Box'
import { Button } from '@/components/core'
import { Menu } from '../Menu'
import { filterNavigation, NavRoute, NAVIGATION_DATA } from '@/utils/navigation'
import classes from './Navbar.module.scss'

const NAME = 'Navbar' as const,
	DEFAULT_TAG = 'nav' as const

interface NavbarProps {
	routes?: NavRoute[]
}

interface NavbarSpecs {
	default: { component: typeof DEFAULT_TAG }
	props: NavbarProps
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
					<Menu
						menu={ navItems }
						routes={ routes }
						{ ...styles('menu') }
					/>
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
}
