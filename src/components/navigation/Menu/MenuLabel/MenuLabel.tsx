import Link from 'next/link'
import { extractOthers } from '@/hooks/useProps'
import { polymorphic } from '@/lib/component/factory'
import { Box } from '@/components/polymorphic/Box'
import type { ReactNode } from 'react'
import type { NavigationItem } from '@/utils/navigation'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import classes from '../Menu.module.scss'

const NAME = 'Menu.Label' as const,
	TAG = 'span' as const

const DEFAULT_PROPS = {
	as: TAG,
	isActive: false,
} as const

interface MenuLabelProps {
	isActive?: boolean
	label: ReactNode
	route?: NavigationItem['route']
}

interface MenuLabelSpecs {
	defaults: {
		as: typeof TAG
		props: PropsDefaultList<typeof DEFAULT_PROPS>
	}
	props: MenuLabelProps
	selectors: MenuLabelSelectors
}

type MenuLabelSelectors =
	| 'label'

export const MenuLabel = polymorphic<MenuLabelSpecs>((_props, { useProps, useStyles }) => {
	const props = useProps(_props)
	const styles = useStyles({ name: 'menu-item', props })

	const {
		as, children, isActive,
		label, route,
		...rest
	} = props

	const others = extractOthers(rest)

	const sharedProps = {
		...styles('label'),
		...others,
		role: 'menuitem',
	}

	if (route) {
		return (
			<Box
				{ ...sharedProps }
				as={ Link }
				attributes={ { aria: {
					current: isActive ? 'page' : undefined,
				} } }
				href={ route }
				scroll={ true }
				shallow={ false }
			>
				{ label }
			</Box>
		)
	}

	return (
		<Box
			{ ...sharedProps }
			as={ as }
			tabIndex={ -1 }
		>
			{ label }
		</Box>
	)
}, { name: NAME, classes })

MenuLabel.set({
	defaultProps: DEFAULT_PROPS,
	displayName: NAME,
})

export declare namespace MenuLabel {
	export type Props = MenuLabelProps
	export type Specs = MenuLabelSpecs
}
