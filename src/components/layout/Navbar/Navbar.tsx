'use client'

import { useProps, useStyles } from '@/hooks'
import { Box, polymorphic } from '@/components/core/Box'
import { Button } from '@/components/core'
import { Navmenu } from './Menu'
import { Navitem } from './Item'
import { NAVITEMS, NavRoute } from '@/utils/constants'
import classes from './Navbar.module.scss'

const NAME = 'Navbar' as const,
	DEFAULT_TAG = 'nav' as const

interface NavbarProps {
	routes: NavRoute[]
}

interface NavbarSpecs {
	default: { component: typeof DEFAULT_TAG }
	props: NavbarProps
	subcomponents: {
		Menu: typeof Navmenu
		Item: typeof Navitem
	}
}

interface NavItem<T extends string = NavRoute> {
	label: string
	href: T
	items?: T[]
}

const getNavRoutes = <T extends Record<string, string | number>>(routes: T, label: string): T[keyof T][] => {
	const allCaps = label.toUpperCase()
	return (Object.keys(routes) as (keyof T)[])
		.reduce<T[keyof T][]>((acc, key) => {
			if (isNaN(Number(key)) && (String(key).includes(allCaps) && key !== allCaps))
				acc.push(routes[key])
			return acc
		}, [])
}

const getNavLabels = <T extends NavRoute>(navitems: Record<T, string>, routes: T[]): NavItem<T>[] =>
	(Object.keys(navitems) as T[])
		.reduce<NavItem<T>[]>((acc, path) => {
			const href = routes.find(route => path === route)

			if (href) {
				const label = navitems[href],
					items = getNavRoutes(NavRoute, label) as T[]
				acc.push({ href, label, items })
			}

			return acc
		}, [])

export const Navbar = polymorphic<NavbarSpecs>(_props => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props })

	const {
		as,
		// children,
		routes,
		...rest
	} = props

	const navItems = getNavLabels(NAVITEMS, routes)
	// console.log({ navItems })


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
					<Navmenu items={ navItems } trigger="click here">
						<ul>
							{ navItems.map(({ label, href, items }) => (
								<li key={ `${label}-${href}` }>
									<Link href={ href as Route<typeof href> }>
										{ label }
									</Link>
									{ items && items.length > 1 && (
										<ul>
											{ getNavLabels(NAVITEMS, items).map(item => (
												<li key={ `${item.label}-${item.href}` }>
													<Link href={ item.href as Route<typeof href> }>
														{ item.label }
													</Link>
												</li>
											)) }
										</ul>
									) }
								</li>
							)) }
						</ul>
					</Navmenu>
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
