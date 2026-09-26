import { useProps, extractOtherProps } from '@/hooks/useProps'
import { useStyles } from '@/hooks/useStyles'
import { polymorphic } from '@/lib/component'
import { Box } from '@/components/polymorphic/Box'
import { MenuItem } from './MenuItem'
import type { NavigationItem } from '@/utils/navigation'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import classes from './Menu.module.scss'

const NAME = 'Menu' as const,
	TAG = 'ul' as const

const DEFAULT_PROPS = {
	as: TAG,
	hasDropdowns: true,
} as const

interface MenuProps {
	hasDropdowns?: boolean
	items: NavigationItem['menu']
}

interface MenuSpecs {
	defaults: {
		as: typeof TAG
		props: PropsDefaultList<typeof DEFAULT_PROPS>
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
			as={ TAG }
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
Menu.setDefaults({ props: DEFAULT_PROPS })

export declare namespace Menu {
	export type Props = MenuProps
	export type Specs = MenuSpecs
}
