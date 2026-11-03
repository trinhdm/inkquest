import { extractOthers } from '@/hooks/useProps'
import { polymorphic } from '@/lib/component/factory'
import { toKebabCase } from '@/utils/helpers'
import { Box } from '@/components/polymorphic/Box'
import { MenuDropdown } from '../MenuDropdown'
import { MenuLabel } from '../MenuLabel'
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
		Pick<Menu.Props, 'active' | 'depth' | 'hasDropdowns' | 'trigger'> {}

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
		active, as, attributes,
		depth, hasDropdowns, id,
		label, menu, route, trigger,
		...rest
	} = props

	const others = extractOthers(rest)
	const isDropdown = !!menu?.length

	const setAttributes = (isCurrent: boolean) => ({
		...attributes,
		data: {
			...attributes?.data,
			current: isCurrent || attributes?.data?.current || null,
		},
	})

	const isActive = isCurrentRoute(route, active),
		itemLabel = trigger ?? label,
		labelEl = <MenuLabel isActive={ isActive } label={ itemLabel } route={ route } />

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
			depth={ depth }
			hasCaret={ typeof itemLabel === 'string' }
			id={ id ?? `dropdown-${toKebabCase(label)}` }
			label={ labelEl }
			menu={ menu }
			trigger={ trigger }
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
