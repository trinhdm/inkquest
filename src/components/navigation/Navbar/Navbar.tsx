'use client'

import { extractOthers } from '@/hooks/useProps'
import { filterNavigation, type NavRoute } from '@/utils/navigation'
import { polymorphic } from '@/lib/component'
import { Box } from '@/components/polymorphic/Box'
import { Button } from '@/components/core/Button'
import { Logo } from '../Logo'
import { Menu } from '../Menu'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import classes from './Navbar.module.scss'

const NAME = 'Navbar' as const,
	TAG = 'nav' as const

const DEFAULT_PROPS = {
	as: TAG,
} as const

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
	| 'col' | 'menu'

export const Navbar = polymorphic<NavbarSpecs>((_props, { useProps, useStyles }) => {
	const props = useProps(_props)
	const styles = useStyles({ props })

	const { as, routes, ...rest } = props
	const others = extractOthers(rest)

	const navitems = filterNavigation(routes)

	return (
		<Box
			{ ...styles('root') }
			{ ...others }
			as={ as }
			role="navigation"
		>
			<div { ...styles('wrapper', true) }>
				<div { ...styles('inner') }>
					<div { ...styles('col') }>
						<Logo width={ 124 } />
					</div>

					{ !!navitems.length && (
						<div { ...styles('col') }>
							<Menu items={ navitems } { ...styles('menu') } />
						</div>
					) }

					<div { ...styles('col') }>
						<Button.Group hasPriority={ false } size="sm">
							<Button variant="ghost">Log in</Button>
							<Button>Sign up</Button>
						</Button.Group>
					</div>
				</div>
			</div>
		</Box>
	)
}, { name: NAME, classes })

Navbar.setDefaults({ props: DEFAULT_PROPS })

export declare namespace Navbar {
	export type Props = NavbarProps
	export type Specs = NavbarSpecs
}
