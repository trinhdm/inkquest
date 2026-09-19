import { filterNavigation, NAVIGATION_DATA, NavRoutes } from '../navigation'
import type { NavigationItem, NavRoute } from '../navigation'

describe('filterNavigation - short-circuit behavior', () => {
	it('returns the given navitems unchanged when routes is undefined', () => {
		const navitems: NavigationItem[] = [{ label: 'Home', route: NavRoutes.HOME }]
		expect(filterNavigation(undefined, navitems)).toBe(navitems)
	})

	it('returns the given navitems unchanged when routes is an empty array', () => {
		const navitems: NavigationItem[] = [{ label: 'Home', route: NavRoutes.HOME }]
		expect(filterNavigation([], navitems)).toBe(navitems)
	})

	it('defaults navitems to NAVIGATION_DATA when routes is undefined and no navitems are supplied', () => {
		expect(filterNavigation()).toBe(NAVIGATION_DATA)
	})
})

describe('filterNavigation - flat filtering', () => {
	const navitems: NavigationItem[] = [
		{ label: 'Home', route: NavRoutes.HOME },
		{ label: 'Marketplace', route: NavRoutes.MARKETPLACE },
		{ label: 'Login', route: NavRoutes.LOGIN },
	]

	it('keeps only items whose route is included in the routes list', () => {
		const result = filterNavigation([NavRoutes.HOME], navitems)
		expect(result).toEqual([{ label: 'Home', route: NavRoutes.HOME, menu: undefined }])
	})

	it('preserves the original ordering of the surviving items', () => {
		const result = filterNavigation([NavRoutes.LOGIN, NavRoutes.HOME], navitems)
		expect(result.map(item => item.label)).toEqual(['Home', 'Login'])
	})

	it('returns an empty array when no item route matches', () => {
		expect(filterNavigation(['/nonexistent' as NavRoute], navitems)).toEqual([])
	})

	it('excludes an item entirely when it has no `route` of its own, even though it would otherwise be relevant', () => {
		const withRouteless: NavigationItem[] = [
			...navitems,
			{ label: 'User', menu: [{ label: 'Profile', route: NavRoutes.PROFILE }] },
		]

		const result = filterNavigation([NavRoutes.PROFILE], withRouteless)
		expect(result).toEqual([])
	})
})

describe('filterNavigation - nested menu recursion', () => {
	const navitems: NavigationItem[] = [
		{
			label: 'Discover',
			route: NavRoutes.DISCOVER,
			menu: [{ label: 'Your Style', route: NavRoutes.DISCOVER_STYLE }],
		},
	]

	it('keeps a parent item and recursively filters its submenu against the same routes list', () => {
		const result = filterNavigation(
			[NavRoutes.DISCOVER, NavRoutes.DISCOVER_STYLE],
			navitems
		)

		expect(result).toEqual([
			{
				label: 'Discover',
				route: NavRoutes.DISCOVER,
				menu: [{ label: 'Your Style', route: NavRoutes.DISCOVER_STYLE, menu: undefined }],
			},
		])
	})

	it('keeps the parent item but drops its child when the child route is absent from the routes list', () => {
		const result = filterNavigation([NavRoutes.DISCOVER], navitems)

		expect(result).toEqual([
			{ label: 'Discover', route: NavRoutes.DISCOVER, menu: [] },
		])
	})

	it('drops the parent (and therefore its entire submenu) when only the child route is present, since the parent lacks a route match', () => {
		const result = filterNavigation([NavRoutes.DISCOVER_STYLE], navitems)
		expect(result).toEqual([])
	})

	it('filters multiple levels of nesting, dropping deeply-nested sibling branches independently', () => {
		const deep: NavigationItem[] = [
			{
				label: 'Community',
				route: NavRoutes.COMMUNITY,
				menu: [
					{
						label: 'Events',
						route: NavRoutes.COMMUNITY_EVENTS,
						menu: [{ label: 'Your Lineup', route: NavRoutes.COMMUNITY_EVENTS_LINEUP }],
					},
					{
						label: 'Feed',
						route: NavRoutes.COMMUNITY_FEED,
						menu: [{ label: 'Your Circle', route: NavRoutes.COMMUNITY_FEED_CIRCLE }],
					},
					{ label: 'Spotlights', route: NavRoutes.COMMUNITY_SPOTLIGHTS },
				],
			},
		]

		const result = filterNavigation(
			[NavRoutes.COMMUNITY, NavRoutes.COMMUNITY_EVENTS, NavRoutes.COMMUNITY_EVENTS_LINEUP],
			deep
		)

		expect(result).toEqual([
			{
				label: 'Community',
				route: NavRoutes.COMMUNITY,
				menu: [
					{
						label: 'Events',
						route: NavRoutes.COMMUNITY_EVENTS,
						menu: [
							{ label: 'Your Lineup', route: NavRoutes.COMMUNITY_EVENTS_LINEUP, menu: undefined },
						],
					},
				],
			},
		])
	})

	it('leaves menu as undefined (not an empty array) on a matched item that never had a menu to begin with', () => {
		const result = filterNavigation(
			[NavRoutes.MARKETPLACE],
			[{ label: 'Marketplace', route: NavRoutes.MARKETPLACE }]
		)

		expect(result[0].menu).toBeUndefined()
	})
})

describe('filterNavigation - reproduction of the reported in-app navigation bug', () => {
	// src/app/layout.tsx passes only the top-level routes it renders as nav
	// items; filterNavigation drops any child whose own route is not also
	// present in that exact list, and drops route-less parents outright.
	const topLevelRoutesOnly: NavRoute[] = [
		NavRoutes.HOME,
		NavRoutes.DISCOVER,
		NavRoutes.MARKETPLACE,
		NavRoutes.COMMUNITY,
		NavRoutes.LOGIN,
		NavRoutes.SIGNUP,
	]

	it('makes /discover/style unreachable because it is a child route absent from the top-level routes list', () => {
		const result = filterNavigation(topLevelRoutesOnly, NAVIGATION_DATA)
		const discover = result.find(item => item.route === NavRoutes.DISCOVER)

		expect(discover?.menu).toEqual([])
	})

	it('makes /community/events/lineup and /community/feed/circle unreachable for the same reason', () => {
		const result = filterNavigation(topLevelRoutesOnly, NAVIGATION_DATA)
		const community = result.find(item => item.route === NavRoutes.COMMUNITY)

		expect(community?.menu).toEqual([])
	})

	it('excludes the top-level "User" entry entirely because it has no route of its own, hiding Profile/Settings from top-level nav', () => {
		const result = filterNavigation(topLevelRoutesOnly, NAVIGATION_DATA)
		expect(result.find(item => item.label === 'User')).toBeUndefined()
	})

	it('would surface the nested routes correctly if the caller passed the full route list, confirming the recursion itself is sound', () => {
		const fullRouteList = Object.values(NavRoutes) as NavRoute[]
		const result = filterNavigation(fullRouteList, NAVIGATION_DATA)
		const discover = result.find(item => item.route === NavRoutes.DISCOVER)
		const community = result.find(item => item.route === NavRoutes.COMMUNITY)
		const events = community?.menu?.find(item => item.route === NavRoutes.COMMUNITY_EVENTS)

		expect(discover?.menu).toEqual([
			{ label: 'Your Style', route: NavRoutes.DISCOVER_STYLE, menu: undefined },
		])
		expect(events?.menu).toEqual([
			{ label: 'Your Lineup', route: NavRoutes.COMMUNITY_EVENTS_LINEUP, menu: undefined },
		])
	})
})
