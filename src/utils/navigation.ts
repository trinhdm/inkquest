import type { Route } from 'next'

export enum NavRoutes {
	HOME = '/',
	DISCOVER = '/discover',
	DISCOVER_STYLE = '/discover/style',
	MARKETPLACE = '/marketplace',
	COMMUNITY = '/community',
	COMMUNITY_EVENTS = '/community/events',
	COMMUNITY_EVENTS_LINEUP = '/community/events/lineup',
	COMMUNITY_FEED = '/community/feed',
	COMMUNITY_FEED_CIRCLE = '/community/feed/circle',
	COMMUNITY_SPOTLIGHTS = '/community/spotlights',
	PROFILE = '/profile',
	SETTINGS = '/settings',
	LOGIN = '/login',
	SIGNUP = '/signup',
}

// checks if slugs exist
const NAV_ROUTES = {
	HOME: '/',
	DISCOVER: '/discover',
	DISCOVER_STYLE: '/discover/style',
	MARKETPLACE: '/marketplace',
	COMMUNITY: '/community',
	COMMUNITY_EVENTS: '/community/events',
	COMMUNITY_EVENTS_LINEUP: '/community/events/lineup',
	COMMUNITY_FEED: '/community/feed',
	COMMUNITY_FEED_CIRCLE: '/community/feed/circle',
	COMMUNITY_SPOTLIGHTS: '/community/spotlights',
	PROFILE: '/profile',
	SETTINGS: '/settings',
	LOGIN: '/login',
	SIGNUP: '/signup',
} as const satisfies Record<`${keyof typeof NavRoutes}`, Route>

export type NavRoute = `${NavRoutes}`

export interface NavigationItem {
	label: string
	menu?: NavigationItem[]
	route?: NavRoute
}

export const NAVIGATION_DATA: NavigationItem[] = [
	{
		label: 'Home',
		route: NavRoutes.HOME,
	},
	{
		label: 'Discover',
		route: NavRoutes.DISCOVER,
		menu: [
			{ label: 'Your Style', route: NavRoutes.DISCOVER_STYLE },
		],
	},
	{
		label: 'Marketplace',
		route: NavRoutes.MARKETPLACE,
	},
	{
		label: 'Community',
		route: NavRoutes.COMMUNITY,
		menu: [
			{
				label: 'Events',
				route: NavRoutes.COMMUNITY_EVENTS,
				menu: [
					{ label: 'Your Lineup', route: NavRoutes.COMMUNITY_EVENTS_LINEUP },
				],
			},
			{
				label: 'Feed',
				route: NavRoutes.COMMUNITY_FEED,
				menu: [
					{ label: 'Your Circle', route: NavRoutes.COMMUNITY_FEED_CIRCLE },
				],
			},
			{ label: 'Spotlights', route: NavRoutes.COMMUNITY_SPOTLIGHTS },
		],
	},
	{
		label: 'User',
		menu: [
			{ label: 'Profile', route: NavRoutes.PROFILE },
			{ label: 'Settings', route: NavRoutes.SETTINGS },
		],
	},
	{
		label: 'Log in',
		route: NavRoutes.LOGIN,
	},
	{
		label: 'Sign up',
		route: NavRoutes.SIGNUP,
	},
]


export const filterNavigation = (
	routes?: readonly NavRoute[],
	layout: 'breadcrumbs' | 'dropdown' = 'dropdown',
	isEmptyReturn = true,
	navitems: NavigationItem[] = NAVIGATION_DATA,
): NavigationItem[] => {
	if (!routes?.length)
		return isEmptyReturn ? [] : navitems

	const filterNavitems = (
		items: NavigationItem[],
		routes: readonly NavRoute[],
	): NavigationItem[] =>
		items.reduce<NavigationItem[]>((acc, item) => {
			const list: NavigationItem[] = [],
				submenu = item.menu && filterNavitems(item.menu, routes)

			if (!!item.route && routes.includes(item.route)) {
				const target = { ...item }

				if (layout === 'dropdown' && submenu)
					Object.assign(target, { menu: submenu })

				list.push(target)
			} else if (submenu) {
				list.push(...submenu)
			}

			acc.push(...new Set(list))
			return acc
		}, [])

	return filterNavitems(navitems, routes)
}
