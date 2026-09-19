'use client'

import { useProps, useStyles, extractOtherProps } from '@/hooks'
import { filterNavigation, NavRoute } from '@/utils/navigation'
import { polymorphic, Box } from '@/components/polymorphic'
import { Menu } from '../Menu'
import classes from './Subnav.module.scss'

const NAME = 'Subnav' as const,
	TAG = 'div' as const

interface SubnavProps {
	routes: NavRoute[]
}

interface SubnavSpecs {
	defaults: { as: typeof TAG }
	props: SubnavProps
}

export const Subnav = polymorphic<SubnavSpecs>(_props => {
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
		>
			<div { ...styles('wrapper', true) }>
				<div { ...styles('inner') }>
					{ !!navItems.length && (
						<>
							<span { ...styles('label') }>
								{ navItems[0].label }
							</span>
							<Menu
								hasDropdowns={ false }
								items={ navItems }
								{ ...styles('menu') }
							/>
						</>
					) }
				</div>
			</div>
		</Box>
	)
}, classes)

Subnav.displayName = NAME
Subnav.setDefaults({ props: { as: TAG } })

export declare namespace Subnav {
	export type Props = SubnavProps
	export type Specs = SubnavSpecs
}
