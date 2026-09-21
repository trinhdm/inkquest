'use client'

import Link from 'next/link'
import { useProps, extractOtherProps } from '@/hooks/useProps'
import { useStyles } from '@/hooks/useStyles'
import { filterNavigation, NavRoute } from '@/utils/navigation'
import { polymorphic } from '@/lib/component'
import { Box } from '@/components/polymorphic/Box'
import { Button } from '@/components/core'
import { Menu } from '../Menu'
import type { ListProps } from '@/lib/component/factory/types'
import classes from './Navbar.module.scss'

const NAME = 'Navbar' as const,
	TAG = 'nav' as const

const DEFAULT_PROPS = {
	as: TAG,
} as const

interface NavbarProps {
	routes?: NavRoute[]
}

interface NavbarSpecs {
	defaults: {
		as: typeof TAG
		props: ListProps<typeof DEFAULT_PROPS>
	}
	props: NavbarProps
}

export const Navbar = polymorphic<NavbarSpecs>(_props => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props })

	const { routes, ...rest } = props
	const { as, others } = extractOtherProps(rest)

	const navItems = filterNavigation(routes)

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
						<Link href="/">logo</Link>
					</div>

					{ !!navItems.length && (
						<div { ...styles('col') }>
							<Menu
								items={ navItems }
								{ ...styles('menu') }
							/>
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
}, classes)

Navbar.displayName = NAME
Navbar.setDefaults({ props: DEFAULT_PROPS })

export declare namespace Navbar {
	export type Props = NavbarProps
	export type Specs = NavbarSpecs
}
