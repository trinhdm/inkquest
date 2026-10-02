'use client'

import { useProps, extractOtherProps } from '@/hooks/useProps'
import { useStyles } from '@/hooks/useStyles'
import { filterNavigation, NavRoute, type NavigationGroup } from '@/utils/navigation'
import { polymorphic } from '@/lib/component'
import { Box } from '@/components/polymorphic/Box'
import { Menu } from '../Menu'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import classes from './Subnav.module.scss'

const NAME = 'Subnav' as const,
	TAG = 'div' as const

const DEFAULT_PROPS = {
	as: TAG,
} as const

interface SubnavProps
	extends NavigationGroup {}

interface SubnavSpecs {
	defaults: {
		as: typeof TAG
		props: PropsDefaultList<typeof DEFAULT_PROPS>
	}
	props: SubnavProps
}

export const Subnav = polymorphic<SubnavSpecs>(_props => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props })

	const { as, category, routes, ...rest } = props
	const others = extractOtherProps(rest)

	const navitems = filterNavigation(routes, 'breadcrumbs')

	if (!navitems.length) return null

	return (
		<Box
			{ ...styles('root') }
			{ ...others }
			as={ as }
		>
			<div { ...styles('wrapper', true) }>
				<div { ...styles('inner') }>
					<span { ...styles('label') }>
						{ category ?? navitems[0].label }
					</span>

					<Menu
						{ ...styles('menu') }
						hasDropdowns={ false }
						items={ navitems }
					/>
				</div>
			</div>
		</Box>
	)
}, classes)

Subnav.displayName = NAME
Subnav.setDefaults({ props: DEFAULT_PROPS })

export declare namespace Subnav {
	export type Props = SubnavProps
	export type Specs = SubnavSpecs
}
