import { SOCIAL_BRANDS } from './constants'
import type { Route } from 'next'
import type { Orientation, SocialBrand } from '@/types/shared'

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
	COMPANY_ABOUT = '/about',
	COMPANY_CAREERS = '/careers',
	COMPANY_FAQS = '/faqs',
	COMPANY_PRESS = '/press',
	COMPANY_SUPPORT = '/support',
	LEGAL_COOKIES = '/cookies',
	LEGAL_PRIVACY = '/privacy-policy',
	LEGAL_TERMS = '/terms',
	PROFILE = '/profile',
	SETTINGS = '/settings',
	LOGIN = '/login',
	SIGNUP = '/signup',
}

// checks if slugs exist
export const NAV_ROUTES = {
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
	COMPANY_ABOUT: '/about',
	COMPANY_CAREERS: '/careers',
	COMPANY_FAQS: '/faqs',
	COMPANY_PRESS: '/press',
	COMPANY_SUPPORT: '/support',
	LEGAL_COOKIES: '/cookies',
	LEGAL_PRIVACY: '/privacy-policy',
	LEGAL_TERMS: '/terms',
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

export interface NavigationGroup<T extends string = string> {
	category?: string
	location?: T
	routes: readonly NavRoute[]
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
		label: 'Company',
		menu: [
			{ label: 'About', route: NavRoutes.COMPANY_ABOUT },
			{ label: 'Careers', route: NavRoutes.COMPANY_CAREERS },
			{ label: 'FAQs', route: NavRoutes.COMPANY_FAQS },
			{ label: 'Press', route: NavRoutes.COMPANY_PRESS },
			{ label: 'Support', route: NavRoutes.COMPANY_SUPPORT },
		],
	},
	{
		label: 'Legal',
		menu: [
			{ label: 'Privacy', route: NavRoutes.LEGAL_PRIVACY },
			{ label: 'Terms', route: NavRoutes.LEGAL_TERMS },
			{ label: 'Cookies', route: NavRoutes.LEGAL_COOKIES },
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

export const listRoutesWithSlug = (
	slug: NavRoute,
	maxDepth: number = Infinity,
	navitems: NavigationItem[] = NAVIGATION_DATA,
): NavRoute[] => {
	const filterRoutes = (items: NavigationItem[], depth: number): NavRoute[] =>
		items.reduce<NavRoute[]>((acc, item) => {
			let routes: NavRoute[] = []

			if (depth <= maxDepth) {
				if (item.route?.includes(slug))
					routes.push(item.route)

				if (!!item.menu?.length) {
					const nestedRoutes = filterRoutes(item.menu, depth + 1)
					routes = [...routes, ...nestedRoutes]
				}
			}

			acc.push(...new Set(routes))
			return acc
		}, [])

	const [subdir] = slug.split('/').filter(Boolean)
	const list = navitems.filter(item => {
		const { menu, route } = item
		if (route) return route?.startsWith(`/${subdir}`)

		if (!!menu?.length) {
			const subitem = menu.find(sub => sub.route?.startsWith(`/${subdir}`))
			if (subitem) return item
		}
	})

	return filterRoutes(list, 0)
}

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

interface FooterNavGroup
	extends NavigationGroup<'info' | 'legal'> {
	orientation?: Orientation
}

export const HEADER_GLOBAL_NAV: readonly NavRoute[] = [
	'/discover',
	'/marketplace',
	'/community',
]

export const FOOTER_GLOBAL_NAV: FooterNavGroup[] = [
	{
		category: 'Discover',
		routes: listRoutesWithSlug('/discover'),
	},
	{
		category: 'Marketplace',
		routes: listRoutesWithSlug('/marketplace'),
	},
	{
		category: 'Community',
		routes: listRoutesWithSlug('/community'),
	},
	{
		category: 'Company',
		routes: ['/about', '/faqs', '/careers', '/press'],
	},
	{
		routes: ['/privacy-policy', '/terms', '/cookies'],
		location: 'legal',
		orientation: 'horizontal',
	},
] as const

interface SocialBrandGroup {
	type: SocialBrand
	url: Route
}

const getSocials = (handle: string): SocialBrandGroup[] => {
	const socials: SocialBrandGroup[] = []

	for (const brand of SOCIAL_BRANDS) {
		const url: Route = `https://${brand}.com/${handle}`
		socials.push({ type: brand, url })
	}

	return socials
}

const BRAND_HANDLE = 'inkquest'
export const SOCIALS_NAV = getSocials(BRAND_HANDLE)
