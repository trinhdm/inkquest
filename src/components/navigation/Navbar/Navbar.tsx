'use client'

import Link from 'next/link'
import { useProps, useStyles, extractOtherProps } from '@/hooks'
import { filterNavigation, NavRoute } from '@/utils/navigation'
import { Box, polymorphic } from '@/components/core/Box'
import { Button } from '@/components/core'
import { Menu } from '../Menu'
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

	const { routes, ...rest } = props
	const { as, others } = extractOtherProps(rest)

	const navItems = filterNavigation(routes)

	return (
		<Box
			{ ...styles('root') }
			{ ...others }
			as={ as }
			role="navigation"
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
