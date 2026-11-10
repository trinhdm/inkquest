import { deepMerge, toSlug } from '@/utils/helpers'
import { extractOthers } from '@/hooks/useProps'
import { polymorphic } from '@/lib/component/factory'
import { Box } from '@/components/polymorphic/Box'
import { MenuDropdown } from '../MenuDropdown'
import { MenuLabel } from '../MenuLabel'
import type { ReactNode } from 'react'
import type { Menu } from '../Menu'
import type { NavigationItem } from '@/utils/navigation'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import classes from '../Menu.module.scss'

const NAME = 'Menu.Item' as const,
	TAG = 'li' as const

const DEFAULT_PROPS = {
	as: TAG,
	hasDropdowns: true,
} as const

interface MenuItemProps
	extends
		NavigationItem,
		Pick<Menu.Props, 'active' | 'depth' | 'hasDropdowns'> {
	trigger?: ReactNode
}

interface MenuItemSpecs {
	defaults: {
		as: typeof TAG
		props: PropsDefaultList<typeof DEFAULT_PROPS>
	}
	props: MenuItemProps
	selectors: MenuItemSelectors
}

type MenuItemSelectors =
	| 'root'

const isCurrentRoute = (
	route?: NavigationItem['route'],
	active?: NavigationItem['route'],
) =>
	!!route && route === active

export const MenuItem = polymorphic<MenuItemSpecs>((_props, { useProps, useStyles }) => {
	const props = useProps(_props)
	const styles = useStyles({ props })

	const {
		action, active, as,
		attributes, className, depth,
		hasDropdowns, id, label,
		menu, route, trigger,
		...rest
	} = props

	const others = extractOthers(rest)
	const isActive = isCurrentRoute(route, active),
		isDropdown = !!menu?.length

	const setAttributes = (isCurrent: boolean) => {
		const dataAttrs = { data: { current: isCurrent || attributes?.data?.current || null } }
		return deepMerge(attributes ?? {}, dataAttrs)
	}

	const labelEl = (
		<MenuLabel
			action={ action }
			isActive={ isActive }
			label={ label }
			route={ route }
			trigger={ trigger }
		/>
	)

	const sharedProps = {
		...styles('root'),
		...others,
		as,
		role: 'none',
	}

	if (!isDropdown) {
		return (
			<Box { ...sharedProps } attributes={ setAttributes(isActive) }>
				{ labelEl }
			</Box>
		)
	}

	else if (!hasDropdowns) {
		return menu?.map(item => {
			const isCurrent = isCurrentRoute(item.route, active)

			return (
				<Box
					{ ...sharedProps }
					attributes={ setAttributes(isCurrent) }
					key={ item.label }
				>
					<MenuLabel { ...item } isActive={ isCurrent } />
				</Box>
			)
		})
	}

	return (
		<MenuDropdown
			active={ active }
			as={ as }
			attributes={ setAttributes(isActive) }
			className={ className }
			depth={ depth }
			hasCaret={ trigger == null }
			id={ id ?? `dropdown-${toSlug(label)}` }
			label={ label }
			menu={ menu }
			trigger={ labelEl }
		/>
	)
}, { name: NAME, classes })

MenuItem.set({
	defaultProps: DEFAULT_PROPS,
	displayName: NAME,
})

export declare namespace MenuItem {
	export type Props = MenuItemProps
	export type Specs = MenuItemSpecs
}
