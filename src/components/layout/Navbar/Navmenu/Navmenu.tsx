import { Box, polymorphic } from '@/components/core/Box'
import { useProps, useStyles } from '@/hooks'
import { Navitem } from '../Navitem'
import { NavRoute } from '@/utils/constants'
import classes from '../Navbar.module.scss'
import type { NavigationItem } from '@/utils/constants'

const NAME = 'Navmenu' as const,
	DEFAULT_TAG = 'ul' as const

interface NavmenuProps {
	menu: NavigationItem['menu']
	routes?: NavRoute[]
}

interface NavmenuSpecs {
	default: { component: typeof DEFAULT_TAG }
	props: NavmenuProps
}

export const Navmenu = polymorphic<NavmenuSpecs>(_props => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props })

	const {
		as,
		menu,
		routes,
		...rest
	} = props

	return (
		<Box
			as={ DEFAULT_TAG }
			role="menubar"
			{ ...styles('root') }
			{ ...rest }
		>
			{ menu?.map(item => <Navitem key={ item.label } { ...item } />) }
		</Box>
	)
}, classes)

Navmenu.displayName = NAME
Navmenu.setDefaults({
	props: {
		as: DEFAULT_TAG,
	}
})

export declare namespace Navmenu {
	export type Props = NavmenuProps
	export type Specs = NavmenuSpecs
}
