import { keyHasValue } from './helpers'
import { SOCIAL_BRANDS } from './constants'
import type { Route } from 'next'
import type { Orientation, SocialBrand } from '@/types/shared'

export enum NavRoutes {
	HOME = '/',
	DISCOVER = '/discover',
	DISCOVER_ARTISTS = '/discover/artists',
	DISCOVER_STYLE = '/discover/style',
	MARKETPLACE = '/marketplace',
	COMMUNITY = '/community',
	COMMUNITY_EVENTS = '/community/events',
	COMMUNITY_EVENTS_LINEUP = '/community/events/lineup',
	COMMUNITY_EVENTS_NEW = '/community/events/new',
	COMMUNITY_FEED = '/community/feed',
	COMMUNITY_FEED_CIRCLE = '/community/feed/circle',
	COMMUNITY_FEED_NEW = '/community/feed/new',
	COMMUNITY_SPOTLIGHTS = '/community/spotlights',
	COMMUNITY_SPOTLIGHTS_NEW = '/community/spotlights/new',
	COMPANY_ABOUT = '/about',
	COMPANY_CAREERS = '/careers',
	COMPANY_FAQS = '/faqs',
	COMPANY_PRESS = '/press',
	COMPANY_SUPPORT = '/support',
	LEGAL_COOKIES = '/cookies',
	LEGAL_PRIVACY = '/privacy-policy',
	LEGAL_TERMS = '/terms',
	USER_COLLECTIONS = '/collections',
	USER_MESSAGES = '/messages',
	USER_NOTIFICATIONS = '/notifications',
	USER_ONBOARDING = '/onboarding',
	USER_PROFILE = '/profile',
	USER_SETTINGS = '/settings',
	AUTH_LOGIN = '/login',
	AUTH_LOGOUT = '/logout',
	AUTH_SIGNUP = '/signup',
}

//	checks if slugs exist
export const NAV_ROUTES = {
	HOME: '/',
	DISCOVER: '/discover',
	DISCOVER_ARTISTS: '/discover/artists',
	DISCOVER_STYLE: '/discover/style',
	MARKETPLACE: '/marketplace',
	COMMUNITY: '/community',
	COMMUNITY_EVENTS: '/community/events',
	COMMUNITY_EVENTS_LINEUP: '/community/events/lineup',
	COMMUNITY_EVENTS_NEW: '/community/events/new',
	COMMUNITY_FEED: '/community/feed',
	COMMUNITY_FEED_CIRCLE: '/community/feed/circle',
	COMMUNITY_FEED_NEW: '/community/feed/new',
	COMMUNITY_SPOTLIGHTS: '/community/spotlights',
	COMMUNITY_SPOTLIGHTS_NEW: '/community/spotlights/new',
	COMPANY_ABOUT: '/about',
	COMPANY_CAREERS: '/careers',
	COMPANY_FAQS: '/faqs',
	COMPANY_PRESS: '/press',
	COMPANY_SUPPORT: '/support',
	LEGAL_COOKIES: '/cookies',
	LEGAL_PRIVACY: '/privacy-policy',
	LEGAL_TERMS: '/terms',
	USER_COLLECTIONS: '/collections',
	USER_PROFILE: '/profile',
	USER_NOTIFICATIONS: '/notifications',
	USER_MESSAGES: '/messages',
	USER_ONBOARDING: '/onboarding',
	USER_SETTINGS: '/settings',
	AUTH_LOGIN: '/login',
	AUTH_LOGOUT: '/logout',
	AUTH_SIGNUP: '/signup',
} as const satisfies Record<`${keyof typeof NavRoutes}`, Route>

export type NavRoute = `${NavRoutes}`

export interface NavigationItem {
	action?: () => void | Promise<void>
	label: string
	menu?: NavigationItem[]
	route?: NavRoute | null
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
			{ label: 'Artists', route: NavRoutes.DISCOVER_ARTISTS },
			{ label: 'Styles', route: NavRoutes.DISCOVER_STYLE },
		],
	},
	{
		label: 'Marketplace',
		menu: [
			{ label: 'Browse work', route: NavRoutes.MARKETPLACE },
		],
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
		route: NavRoutes.USER_PROFILE,
		menu: [
			{ label: 'Notifications', route: NavRoutes.USER_NOTIFICATIONS },
			{ label: 'Messages', route: NavRoutes.USER_MESSAGES },
			{ label: 'Collections', route: NavRoutes.USER_COLLECTIONS },
			{ label: 'Settings', route: NavRoutes.USER_SETTINGS },
			{ label: 'Sign out', route: NavRoutes.AUTH_LOGOUT, },
		],
	},
	{
		label: 'Company',
		menu: [
			{ label: 'About', route: NavRoutes.COMPANY_ABOUT },
			{ label: 'FAQs', route: NavRoutes.COMPANY_FAQS },
			{ label: 'Careers', route: NavRoutes.COMPANY_CAREERS },
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
		label: 'Sign up',
		route: NavRoutes.AUTH_SIGNUP,
	},
	{
		label: 'Log in',
		route: NavRoutes.AUTH_LOGIN,
	},
] as const

const collectRoutes = (
	items: NavigationItem[],
	maxDepth: number,
	isMatch: (route: NavRoute) => boolean = () => true,
): NavRoute[] => {
	const filterRoutes = (items: NavigationItem[], depth: number): NavRoute[] =>
		items.reduce<NavRoute[]>((acc, item) => {
			let routes: NavRoute[] = []

			if (depth <= maxDepth) {
				if (item.route && isMatch(item.route))
					routes.push(item.route)

				if (!!item.menu?.length) {
					const nestedRoutes = filterRoutes(item.menu, depth + 1)
					routes = [...routes, ...nestedRoutes]
				}
			}

			acc.push(...new Set(routes))
			return acc
		}, [])

	return filterRoutes(items, 0)
}

const inDirectory = (dir: string, route?: NavigationItem['route']) =>
	!!route?.startsWith(`/${dir}`)

export const listRoutesInLabel = (
	label: string,
	maxDepth: number = Infinity,
	navitems: NavigationItem[] = NAVIGATION_DATA,
): NavRoute[] => {
	const parent = navitems.find(item => (label === item.label) && keyHasValue(item, 'menu'))
	return parent ? collectRoutes([parent], maxDepth) : []
}

export const listRoutesWithSlug = (
	slug: NavRoute,
	maxDepth: number = Infinity,
	navitems: NavigationItem[] = NAVIGATION_DATA,
): NavRoute[] => {
	const [subdir] = slug.split('/').filter(Boolean)

	const list = navitems.filter(({ menu, route }) => route
		? inDirectory(subdir, route)
		: !!menu?.some(sub => inDirectory(subdir, sub.route)))

	return collectRoutes(list, maxDepth, route => route.includes(slug))
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

export const getNavigationGroup = <T extends string = string>(
	label: string,
	maxItems?: number,
): NavigationGroup<T> => {
	const routes = listRoutesInLabel(label, 1)
	if (!routes.length) return {} as NavigationGroup<T>

	return {
		category: label,
		routes: !!maxItems ? routes.slice(0, maxItems) : routes,
	}
}

interface FooterNavGroup
	extends NavigationGroup<'info' | 'legal'> {
	orientation?: Orientation
}

export const HEADER_GLOBAL_NAV: readonly NavRoute[] = [
	NavRoutes.DISCOVER,
	NavRoutes.MARKETPLACE,
	NavRoutes.COMMUNITY,
]

export const FOOTER_GLOBAL_NAV: FooterNavGroup[] = [
	getNavigationGroup('Discover'),
	getNavigationGroup('Marketplace'),
	getNavigationGroup('Community'),
	getNavigationGroup('Company', 4),
	{
		location: 'legal',
		orientation: 'horizontal',
		routes: listRoutesInLabel('Legal').slice(0, 3),
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
