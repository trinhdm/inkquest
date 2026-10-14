import { filterNavigation, listRoutesWithSlug, NAV_ROUTES, NAVIGATION_DATA, NavRoutes, SOCIALS_NAV } from '../navigation'
import type { NavigationItem, NavRoute } from '../navigation'

describe('filterNavigation - short-circuit behavior', () => {
	it('returns an empty array when routes is undefined (default isEmptyReturn)', () => {
		expect(filterNavigation(undefined, 'dropdown')).toEqual([])
	})

	it('returns an empty array when routes is an empty array (default isEmptyReturn)', () => {
		expect(filterNavigation([], 'dropdown')).toEqual([])
	})

	it('returns the given navitems unchanged when routes is empty and isEmptyReturn is false', () => {
		const navitems: NavigationItem[] = [{ label: 'Home', route: NavRoutes.HOME }]
		expect(filterNavigation(undefined, 'dropdown', false, navitems)).toBe(navitems)
	})

	it('defaults navitems to NAVIGATION_DATA when routes is empty and isEmptyReturn is false', () => {
		expect(filterNavigation(undefined, 'dropdown', false)).toBe(NAVIGATION_DATA)
	})
})

describe('filterNavigation - flat filtering', () => {
	const navitems: NavigationItem[] = [
		{ label: 'Home', route: NavRoutes.HOME },
		{ label: 'Marketplace', route: NavRoutes.MARKETPLACE },
		{ label: 'Login', route: NavRoutes.LOGIN },
	]

	it('keeps only items whose route is included in the routes list', () => {
		const result = filterNavigation([NavRoutes.HOME], 'dropdown', true, navitems)
		expect(result).toEqual([{ label: 'Home', route: NavRoutes.HOME, menu: undefined }])
	})

	it('preserves the original ordering of the surviving items', () => {
		const result = filterNavigation([NavRoutes.LOGIN, NavRoutes.HOME], 'dropdown', true, navitems)
		expect(result.map(item => item.label)).toEqual(['Home', 'Login'])
	})

	it('returns an empty array when no item route matches', () => {
		expect(filterNavigation(['/nonexistent' as NavRoute], 'dropdown', true, navitems)).toEqual([])
	})

	it('hoists a routeless item\'s matching submenu into the result instead of dropping it', () => {
		const withRouteless: NavigationItem[] = [
			...navitems,
			{ label: 'User', menu: [{ label: 'Profile', route: NavRoutes.PROFILE }] },
		]

		const result = filterNavigation([NavRoutes.PROFILE], 'dropdown', true, withRouteless)
		expect(result).toEqual([{ label: 'Profile', route: NavRoutes.PROFILE, menu: undefined }])
	})
})

describe('filterNavigation - nested menu recursion (dropdown layout)', () => {
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
			'dropdown',
			true,
			navitems,
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
		const result = filterNavigation([NavRoutes.DISCOVER], 'dropdown', true, navitems)

		expect(result).toEqual([
			{ label: 'Discover', route: NavRoutes.DISCOVER, menu: [] },
		])
	})

	it('hoists the child up in place of the parent when only the child route is present, since the parent lacks its own route match', () => {
		const result = filterNavigation([NavRoutes.DISCOVER_STYLE], 'dropdown', true, navitems)
		expect(result).toEqual([{ label: 'Your Style', route: NavRoutes.DISCOVER_STYLE }])
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
			'dropdown',
			true,
			deep,
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
			'dropdown',
			true,
			[{ label: 'Marketplace', route: NavRoutes.MARKETPLACE }],
		)

		expect(result[0].menu).toBeUndefined()
	})
})

describe('filterNavigation - breadcrumbs layout', () => {
	const navitems: NavigationItem[] = [
		{
			label: 'Discover',
			route: NavRoutes.DISCOVER,
			menu: [{ label: 'Your Style', route: NavRoutes.DISCOVER_STYLE }],
		},
	]

	it('leaves a matched parent\'s original, unfiltered menu in place instead of attaching the recursively-filtered submenu', () => {
		// only DISCOVER is in the requested routes, so under 'dropdown' layout
		// menu would become [] (Your Style filtered out); under 'breadcrumbs'
		// the Object.assign that swaps in the filtered submenu never runs, so
		// the original raw menu passes through unfiltered.
		const result = filterNavigation(
			[NavRoutes.DISCOVER],
			'breadcrumbs',
			true,
			navitems,
		)

		expect(result).toEqual([
			{ label: 'Discover', route: NavRoutes.DISCOVER, menu: [{ label: 'Your Style', route: NavRoutes.DISCOVER_STYLE }] },
		])
	})

	it('still hoists a routeless parent\'s matching submenu since hoisting is independent of layout', () => {
		const withRouteless: NavigationItem[] = [
			{ label: 'User', menu: [{ label: 'Profile', route: NavRoutes.PROFILE }] },
		]

		const result = filterNavigation([NavRoutes.PROFILE], 'breadcrumbs', true, withRouteless)
		expect(result).toEqual([{ label: 'Profile', route: NavRoutes.PROFILE, menu: undefined }])
	})
})

describe('filterNavigation - regression coverage for the fixed in-app navigation bug', () => {
	// src/app/layout.tsx passes only the top-level routes it renders as nav
	// items; filterNavigation now hoists a routeless parent's matching
	// submenu into the result, so child routes survive even when their
	// parent has no route of its own or isn't itself in the routes list.
	const topLevelRoutesOnly: NavRoute[] = [
		NavRoutes.HOME,
		NavRoutes.DISCOVER,
		NavRoutes.MARKETPLACE,
		NavRoutes.COMMUNITY,
		NavRoutes.LOGIN,
		NavRoutes.SIGNUP,
	]

	it('drops /discover/style from Discover\'s menu since only /discover is in the routes list (child route not hoisted onto a matched parent)', () => {
		const result = filterNavigation(topLevelRoutesOnly, 'dropdown', true, NAVIGATION_DATA)
		const discover = result.find(item => item.route === NavRoutes.DISCOVER)

		expect(discover?.menu).toEqual([])
	})

	it('drops /community/events/lineup and /community/feed/circle from Community\'s menu for the same reason', () => {
		const result = filterNavigation(topLevelRoutesOnly, 'dropdown', true, NAVIGATION_DATA)
		const community = result.find(item => item.route === NavRoutes.COMMUNITY)

		expect(community?.menu).toEqual([])
	})

	it('excludes the top-level "User" entry entirely because it has no route of its own and its children are not in the routes list', () => {
		const result = filterNavigation(topLevelRoutesOnly, 'dropdown', true, NAVIGATION_DATA)
		expect(result.find(item => item.label === 'User')).toBeUndefined()
	})

	it('surfaces the nested routes correctly when the caller passes the full route list, confirming the recursion itself is sound', () => {
		const fullRouteList = Object.values(NavRoutes) as NavRoute[]
		const result = filterNavigation(fullRouteList, 'dropdown', true, NAVIGATION_DATA)
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

	it('now surfaces Profile/Settings by hoisting them out of the routeless "User" parent when their routes are requested', () => {
		const result = filterNavigation([NavRoutes.PROFILE, NavRoutes.SETTINGS], 'dropdown', true, NAVIGATION_DATA)

		expect(result.map(item => item.label)).toEqual(['Profile', 'Settings'])
		expect(result.find(item => item.label === 'User')).toBeUndefined()
	})
})

describe('listRoutesWithSlug', () => {
	it('prefilters top-level items to those whose own route or a submenu route starts with the slug\'s subdirectory', () => {
		const result = listRoutesWithSlug(NavRoutes.DISCOVER)
		expect(result).toContain(NavRoutes.DISCOVER)
		expect(result).toContain(NavRoutes.DISCOVER_STYLE)
	})

	it('matches routes containing the slug anywhere, not only as a prefix', () => {
		const result = listRoutesWithSlug(NavRoutes.COMMUNITY_EVENTS)
		expect(result).toEqual(expect.arrayContaining([NavRoutes.COMMUNITY_EVENTS, NavRoutes.COMMUNITY_EVENTS_LINEUP]))
	})

	it('stops descending once maxDepth is exceeded, excluding deeper nested matches', () => {
		const result = listRoutesWithSlug(NavRoutes.COMMUNITY, 0)
		expect(result).toEqual([NavRoutes.COMMUNITY])
	})

	it('includes nested matches when maxDepth allows the recursion to reach them', () => {
		const result = listRoutesWithSlug(NavRoutes.COMMUNITY, 1)
		expect(result).toEqual(expect.arrayContaining([
			NavRoutes.COMMUNITY,
			NavRoutes.COMMUNITY_EVENTS,
			NavRoutes.COMMUNITY_FEED,
			NavRoutes.COMMUNITY_SPOTLIGHTS,
		]))
		expect(result).not.toContain(NavRoutes.COMMUNITY_EVENTS_LINEUP)
	})

	it('dedupes a single item\'s own-plus-nested route matches, but not across separate sibling items', () => {
		const navitems: NavigationItem[] = [
			{
				label: 'A',
				route: '/community' as NavRoute,
				menu: [{ label: 'A1', route: '/community' as NavRoute }],
			},
			{ label: 'B', route: '/community' as NavRoute },
		]

		const result = listRoutesWithSlug('/community' as NavRoute, Infinity, navitems)
		expect(result).toEqual(['/community', '/community'])
	})

	it('matches a parent only through a child route when the parent itself has no matching route', () => {
		const navitems: NavigationItem[] = [
			{
				label: 'User',
				menu: [{ label: 'Profile', route: NavRoutes.PROFILE }],
			},
		]

		const result = listRoutesWithSlug(NavRoutes.PROFILE, Infinity, navitems)
		expect(result).toEqual([NavRoutes.PROFILE])
	})

	it('returns an empty array when no top-level item matches the slug\'s subdirectory', () => {
		const result = listRoutesWithSlug('/nonexistent' as NavRoute)
		expect(result).toEqual([])
	})
})

describe('SOCIALS_NAV - getSocials URL construction', () => {
	it('builds each social entry\'s URL from the brand name and the inkquest handle', () => {
		const facebook = SOCIALS_NAV.find(social => social.type === 'facebook')
		expect(facebook?.url).toBe('https://facebook.com/inkquest')
	})

	it('produces one entry per configured social brand', () => {
		expect(SOCIALS_NAV).toHaveLength(5)
	})
})

// NAV_ROUTES is the string-literal twin of the NavRoutes enum; the compiler
// only checks its shape against `Route`, so this guards the two staying equal.
describe('NAV_ROUTES', () => {
	it('has exactly the same keys as the NavRoutes enum', () => {
		expect(Object.keys(NAV_ROUTES).sort()).toEqual(Object.keys(NavRoutes).sort())
	})

	it('maps each key to the same path the enum holds for it', () => {
		for (const key of Object.keys(NavRoutes) as (keyof typeof NavRoutes)[])
			expect(NAV_ROUTES[key]).toBe(NavRoutes[key])
	})

	it('uses a unique path for every key', () => {
		const paths = Object.values(NAV_ROUTES)
		expect(new Set(paths).size).toBe(paths.length)
	})
})
