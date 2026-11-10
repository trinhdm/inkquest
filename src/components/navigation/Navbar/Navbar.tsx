'use client'

import { useId } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/providers/AuthProvider'
import { extractOthers } from '@/hooks/useProps'
import { filterNavigation, listRoutesInLabel, NavRoutes } from '@/utils/navigation'
import { isKeyOf } from '@/utils/helpers'
import { polymorphic } from '@/lib/component/factory'
import { Avatar } from '@/components/core/Avatar'
import { Box } from '@/components/polymorphic/Box'
import { Button } from '@/components/core/Button'
import { Logo } from '../Logo'
import { Menu } from '../Menu'
import type { NavigationItem, NavRoute } from '@/utils/navigation'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import classes from './Navbar.module.scss'

const NAME = 'Navbar' as const,
	TAG = 'nav' as const

const DEFAULT_PROPS = {
	as: TAG,
} as const

const AUTH_COPY = {
	login: {
		button: {
			label: 'Sign up',
			url: NavRoutes.AUTH_SIGNUP,
		},
		tip: 'New to Inkquest?',
	},
	signup: {
		button: {
			label: 'Login',
			url: NavRoutes.AUTH_LOGIN,
		},
		tip: 'Already have an account?',
	},
} as const satisfies Record<'login' | 'signup', NavAuthGroup>

interface NavbarProps {
	routes?: readonly NavRoute[]
}

interface NavbarSpecs {
	defaults: {
		as: typeof TAG
		props: PropsDefaultList<typeof DEFAULT_PROPS>
	}
	props: NavbarProps
	selectors: NavbarSelectors
}

type NavbarSelectors =
	| 'root' | 'wrapper' | 'inner'
	| 'col' | 'menu' | 'buttons' | 'tip'

interface NavAuthGroup {
	button: {
		label: string
		url: string
	}
	tip: string
}

const attachAction = (
	items: NavigationItem[],
	route: NavRoute,
	action: NavigationItem['action'],
): NavigationItem[] =>
	items.map(item => ({
		...item,
		...(item.route === route ? { action } : {}),
		...(item.menu ? { menu: attachAction(item.menu, route, action) } : {}),
	}))

export const Navbar = polymorphic<NavbarSpecs>((_props, { useProps, useStyles }) => {
	const id = useId()
	const pathname = usePathname()

	const { logout, user } = useAuth()
	const props = useProps(_props)
	const styles = useStyles({ props })

	const { as, routes, ...rest } = props
	const others = extractOthers(rest)

	const slug = pathname.slice(1),
		menuItems = filterNavigation(routes)

	const userRoutes = listRoutesInLabel('User'),
		userItems = filterNavigation(userRoutes)

	const authItems = attachAction(userItems, NavRoutes.AUTH_LOGOUT, logout)
	const authTriggers = {
		[NavRoutes.USER_PROFILE]: user && <Avatar ring size="md" user={ user } />
	}

	const isLoginPath = pathname === NavRoutes.AUTH_LOGIN,
		isSignupPath = pathname === NavRoutes.AUTH_SIGNUP,
		isAuthPath = (isLoginPath || isSignupPath) && isKeyOf(AUTH_COPY, slug)

	return (
		<Box
			{ ...styles('root') }
			{ ...others }
			as={ as }
			role={ as === 'nav' ? undefined : 'navigation' }
		>
			<div { ...styles('wrapper', true) }>
				<div { ...styles('inner') }>
					<div { ...styles('col') }>
						<Logo width={ 124 } />
					</div>

					{ !!menuItems.length && (
						<Menu
							{ ...styles('menu') }
							id={ `${id}-nav` }
							items={ menuItems }
						/>
					) }

					<div { ...styles('col') }>
						{ user && (
							<Menu
								id={ `${id}-user` }
								items={ authItems }
								triggers={ authTriggers }
							/>
						) }

						{ (!user && isAuthPath) && (
							<>
								<span { ...styles('tip') }>
									{ AUTH_COPY[slug].tip }
								</span>
								<Button
									href={ AUTH_COPY[slug].button.url }
									size="sm"
									variant="outline"
								>
									{ AUTH_COPY[slug].button.label }
								</Button>
							</>
						) }

						{ (!user && !isAuthPath) && (
							<Button.Group
								{ ...styles('buttons') }
								hasPriority={ false }
								size="sm"
							>
								<Button href={ NavRoutes.AUTH_LOGIN } variant="text">
									Log in
								</Button>
								<Button href={ NavRoutes.AUTH_SIGNUP }>
									Sign up
								</Button>
							</Button.Group>
						) }
					</div>
				</div>
			</div>
		</Box>
	)
}, { name: NAME, classes })

Navbar.set({
	defaultProps: DEFAULT_PROPS,
	displayName: NAME,
})

export declare namespace Navbar {
	export type Props = NavbarProps
	export type Specs = NavbarSpecs
}
