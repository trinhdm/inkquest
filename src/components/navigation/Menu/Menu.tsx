import { usePathname } from 'next/navigation'
import { extractOthers } from '@/hooks/useProps'
import { polymorphic } from '@/lib/component/factory'
import { toKebabCase } from '@/utils/helpers'
import { Box } from '@/components/polymorphic/Box'
import { MenuItem } from './MenuItem'
import type { ReactNode } from 'react'
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
	active?: NavigationItem['route']
	depth?: number
	hasDropdowns?: boolean
	items: NavigationItem['menu']
	orientation?: Orientation
	trigger?: ReactNode
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
		active, as, className,
		depth, hasDropdowns, id,
		items, orientation, trigger,
		...rest
	} = props

	const others = extractOthers(rest)

	const isSurface = depth === 0
	const clsx = {
		module: { [`${orientation}`]: (isSurface && !!orientation) || null },
	}

	const currentRoute = typeof active === 'string' || active === null
		? active
		: (pathname as NavigationItem['route'])

	return (
		<Box
			{ ...styles('root', clsx) }
			{ ...others }
			as={ as }
			id={ id }
			role="menubar"
		>
			{ items?.map(item => (
				<MenuItem
					{ ...item }
					active={ currentRoute }
					className={ className }
					depth={ depth }
					hasDropdowns={ hasDropdowns }
					id={ id && `${id}-${toKebabCase(item.label)}` }
					key={ item.label }
					trigger={ trigger }
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
