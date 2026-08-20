'use client'

import Link from 'next/link'
import { useProps, useStyles, useVariantStyles } from '@/hooks'
import { Box, polymorphic, type BoxProps } from '@/components/core/Box'
import { Button } from '@/components/core'
import type { Route } from 'next'
import classes from './Navbar.module.scss'

const NAME = 'Navbar' as const,
	TAG = 'nav' as const

interface NavbarProps extends BoxProps {
	routes: NavRoute[]
}

interface NavbarSpecs {
	default: { component: typeof TAG }
	props: NavbarProps
}

export enum NavRoute {
	HOME = '/',
	DISCOVER = '/discover',
	MARKETPLACE = '/marketplace',
	COMMUNITY = '/community',
	COMMUNITY_EVENTS = '/community/events',
	COMMUNITY_EVENTS_LINEUP = '/community/events/lineup',
	COMMUNITY_FEED = '/community/feed',
	COMMUNITY_FEED_CIRCLE = '/community/feed/circle',
	COMMUNITY_SPOTLIGHTS = '/community/spotlights',
	LOGIN = '/login',
	SIGNUP = '/signup',
}

interface NavItem<T extends string = NavRoute> {
	label: string
	href: T
	items?: T[]
}

const NAVITEMS: Record<NavRoute, string> = {
	[NavRoute.HOME]: 'Home',
	[NavRoute.DISCOVER]: 'Discover',
	[NavRoute.MARKETPLACE]: 'Marketplace',
	[NavRoute.COMMUNITY]: 'Community',
	[NavRoute.COMMUNITY_EVENTS]: 'Community Events',
	[NavRoute.COMMUNITY_EVENTS_LINEUP]: 'Your Lineup',
	[NavRoute.COMMUNITY_FEED]: 'Community Feed',
	[NavRoute.COMMUNITY_FEED_CIRCLE]: 'Your Circle',
	[NavRoute.COMMUNITY_SPOTLIGHTS]: 'Community Spotlights',
	[NavRoute.LOGIN]: 'Log in',
	[NavRoute.SIGNUP]: 'Sign up',
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
	useVariantStyles(NAME)
	const props = useProps(NAME, _props)
	const styles = useStyles<NavbarSpecs>(NAME, { classes, props })

	const {
		as,
		routes,
		...rest
	} = props

	const navItems = getNavLabels(NAVITEMS, routes)

	return (
		<Box
			as="nav"
			// attributes={ {
			// 	data: { block: !!fullWidth || null },
			// } }
			{ ...styles('root') }
			{ ...rest }
		>
			<Box as="div" { ...styles('inner') }>
				<Box as="div" { ...styles('col') }>
					logo
				</Box>

				{ !!navItems.length && (
					<Box as="div" { ...styles('col') }>
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
					</Box>
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
Navbar.setDefaults({ props: { as: TAG } })

export declare namespace Navbar {
	export type Props = NavbarProps
	export type Specs = NavbarSpecs
}
