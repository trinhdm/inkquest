import type { Route } from 'next'

export const PREFIX_CSS_SELECTOR = 'inkq'
export const PREFIX_CSS_VARS = '--css-prefix'


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


export const NAVITEMS: Record<NavRoutes, string> = {
	[NavRoutes.HOME]: 'Home',
	[NavRoutes.DISCOVER]: 'Discover',
	[NavRoutes.DISCOVER_STYLE]: 'Discover Your Style',
	[NavRoutes.MARKETPLACE]: 'Marketplace',
	[NavRoutes.COMMUNITY]: 'Community',
	[NavRoutes.COMMUNITY_EVENTS]: 'Community Events',
	[NavRoutes.COMMUNITY_EVENTS_LINEUP]: 'Your Lineup',
	[NavRoutes.COMMUNITY_FEED]: 'Community Feed',
	[NavRoutes.COMMUNITY_FEED_CIRCLE]: 'Your Circle',
	[NavRoutes.COMMUNITY_SPOTLIGHTS]: 'Community Spotlights',
	[NavRoutes.PROFILE]: 'Profile',
	[NavRoutes.SETTINGS]: 'Settings',
	[NavRoutes.LOGIN]: 'Log in',
	[NavRoutes.SIGNUP]: 'Sign up',
}
