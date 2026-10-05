import { usePathname } from 'next/navigation'
import { extractOthers } from '@/hooks/useProps'
import { polymorphic } from '@/lib/component'
import { Box } from '@/components/polymorphic/Box'
import { MenuItem } from './MenuItem'
import type { NavigationItem } from '@/utils/navigation'
import type { Orientation } from '@/types/shared'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import classes from './Menu.module.scss'

const NAME = 'Menu' as const,
	TAG = 'ul' as const

const DEFAULT_PROPS = {
	as: TAG,
	depth: 0,
	hasDropdowns: true,
} as const

interface MenuProps {
	activeItem?: NavigationItem['route'] | null
	depth?: number
	hasDropdowns?: boolean
	items: NavigationItem['menu']
	orientation?: Orientation
}

interface MenuSpecs {
	defaults: {
		as: typeof TAG
		props: PropsDefaultList<typeof DEFAULT_PROPS>
	}
	props: MenuProps
	selectors: MenuSelectors
}

type MenuSelectors =
	| 'root'

export const Menu = polymorphic<MenuSpecs>((_props, { useProps, useStyles }) => {
	const pathname = usePathname()
	const props = useProps(_props)
	const styles = useStyles({ props })

	const {
		activeItem,
		className,
		depth,
		hasDropdowns,
		items,
		orientation,
		...rest
	} = props

	const others = extractOthers(rest)

	const clsx = {
		module: { [`${orientation}`]: (depth === 0 && !!orientation) || null },
	}

	const currentRoute = typeof activeItem === 'string' || activeItem === null
		? activeItem
		: (pathname as NavigationItem['route'])

	return (
		<Box
			{ ...styles('root', clsx) }
			{ ...others }
			as={ TAG }
			role="menubar"
		>
			{ items?.map(item => (
				<MenuItem
					key={ item.label }
					activeItem={ currentRoute }
					className={ className }
					depth={ depth }
					hasDropdowns={ hasDropdowns }
					{ ...item }
				/>
			)) }
		</Box>
	)
}, { name: NAME, classes })

Menu.set({
	defaultProps: DEFAULT_PROPS,
	displayName: NAME,
})

export declare namespace Menu {
	export type Props = MenuProps
	export type Specs = MenuSpecs
}
