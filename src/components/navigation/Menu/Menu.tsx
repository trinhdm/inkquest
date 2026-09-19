import { useProps, useStyles, extractOtherProps } from '@/hooks'
import { Box, polymorphic } from '@/components/core/Box'
import { MenuItem } from './MenuItem'
import type { NavigationItem } from '@/utils/navigation'
import classes from './Menu.module.scss'

const NAME = 'Menu' as const,
	DEFAULT_TAG = 'ul' as const

interface MenuProps {
	hasDropdowns?: boolean
	items: NavigationItem['menu']
}

interface MenuSpecs {
	defaults: {
		as: typeof DEFAULT_TAG
		props: 'hasDropdowns'
	}
	props: MenuProps
}

export const Menu = polymorphic<MenuSpecs>(_props => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props })

	const {
		className,
		hasDropdowns,
		items,
		...rest
	} = props

	const { others } = extractOtherProps(rest)
	// const isActive = pathname === route

	return (
		<Box
			as={ DEFAULT_TAG }
			role="menubar"
			{ ...styles('root') }
			{ ...others }
		>
			{ items?.map(item => (
				<MenuItem
					key={ item.label }
					className={ className }
					hasDropdowns={ hasDropdowns }
					{ ...item }
				/>
			)) }
		</Box>
	)
}, classes)

Menu.displayName = NAME
Menu.setDefaults({
	props: {
		as: DEFAULT_TAG,
		hasDropdowns: true,
	}
})

export declare namespace Menu {
	export type Props = MenuProps
	export type Specs = MenuSpecs
}
