'use client'

import { useProps, useStyles } from '@/hooks'
import { filterNavigation, NavRoute } from '@/utils/navigation'
import { Box, polymorphic } from '@/components/core/Box'
import { Button } from '@/components/core'
import { Menu } from '../Menu'
import Link from 'next/link'
import classes from './Navbar.module.scss'

const NAME = 'Navbar' as const,
	DEFAULT_TAG = 'nav' as const

interface NavbarProps {
	routes?: NavRoute[]
}

interface NavbarSpecs {
	defaults: { as: typeof DEFAULT_TAG }
	props: NavbarProps
}

export const Navbar = polymorphic<NavbarSpecs>(_props => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props })
	const { as, routes, ...rest } = props

	const navItems = filterNavigation(routes)

	return (
		<Box
			as="nav"
			role="navigation"
			{ ...styles('root') }
			{ ...rest }
		>
			<div { ...styles('wrapper', true) }>
				<div { ...styles('inner') }>
					<div { ...styles('col') }>
						<Link href="/">logo</Link>
					</div>

					{ !!navItems.length && (
						<div { ...styles('col') }>
							<Menu
								items={ navItems }
								{ ...styles('menu') }
							/>
						</div>
					) }

					<div { ...styles('col') }>
						<Button.Group hasPriority={ false }>
							<Button variant="ghost">Log in</Button>
							<Button>Sign up</Button>
						</Button.Group>
					</div>
				</div>
			</div>
		</Box>
	)
}, classes)

Navbar.displayName = NAME
Navbar.setDefaults({ props: { as: DEFAULT_TAG } })

export declare namespace Navbar {
	export type Props = NavbarProps
	export type Specs = NavbarSpecs
}
