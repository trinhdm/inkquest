'use client'

import { useId } from 'react'
import { usePathname } from 'next/navigation'
import { extractOthers } from '@/hooks/useProps'
import { filterNavigation, listRoutesInLabel, NavRoutes } from '@/utils/navigation'
import { isKeyOf } from '@/utils/helpers'
import { polymorphic } from '@/lib/component/factory'
import { Avatar } from '@/components/core/Avatar'
import { Box } from '@/components/polymorphic/Box'
import { Button } from '@/components/core/Button'
import { Logo } from '../Logo'
import { Menu } from '../Menu'
import { MOCK_ACCOUNT } from '@/lib/form'
import type { NavRoute } from '@/utils/navigation'
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

export const Navbar = polymorphic<NavbarSpecs>((_props, { useProps, useStyles }) => {
	const id = useId()
	const pathname = usePathname()
	const props = useProps(_props)
	const styles = useStyles({ props })

	const { as, routes, ...rest } = props
	const others = extractOthers(rest)

	const slug = pathname.slice(1),
		menuItems = filterNavigation(routes)

	const userRoutes = listRoutesInLabel('User'),
		userItems = filterNavigation(userRoutes)
	const userTriggers = {
		[NavRoutes.USER_PROFILE]: <Avatar ring size="md" user={ MOCK_ACCOUNT } />
	}

	const isLoginPath = pathname === NavRoutes.AUTH_LOGIN,
		isSignupPath = pathname === NavRoutes.AUTH_SIGNUP,
		isAuthPath = (isLoginPath || isSignupPath) && isKeyOf(AUTH_COPY, slug)

	const authCopy = isAuthPath ? AUTH_COPY[slug] : undefined

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
						<div { ...styles('col') }>
							<Menu
								{ ...styles('menu') }
								id={ `${id}-nav` }
								items={ menuItems }
							/>
						</div>
					) }

					<div { ...styles('col') }>
						{ authCopy && (
							<>
								<span { ...styles('tip') }>
									{ authCopy.tip }
								</span>
								<Button
									href={ authCopy.button.url }
									size="sm"
									variant="outline"
								>
									{ authCopy.button.label }
								</Button>
							</>
						) }

						{ !isAuthPath && (
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

						<Menu
							id={ `${id}-user` }
							items={ userItems }
							triggers={ userTriggers }
						/>
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
