import Link from 'next/link'
import { startTransition } from 'react'
import { extractOthers } from '@/hooks/useProps'
import { polymorphic } from '@/lib/component/factory'
import { Box } from '@/components/polymorphic/Box'
import type { MenuItem } from '../MenuItem'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import classes from '../Menu.module.scss'

const NAME = 'Menu.Label' as const,
	TAG = 'span' as const

const DEFAULT_PROPS = {
	as: TAG,
	isActive: false,
} as const

interface MenuLabelProps
	extends Pick<MenuItem.Props, 'action' | 'label' | 'route' | 'trigger'> {
	isActive?: boolean
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
		action, as, children,
		isActive, label,
		route, trigger,
		...rest
	} = props

	const others = extractOthers(rest)
	const content = trigger ?? label

	const sharedProps = {
		...styles('label'),
		...others,
		role: 'menuitem',
	}

	//	a button, not a form: the dropdown's arrow keys only find menuitems that sit directly inside li[role="none"]
	if (action) {
		return (
			<Box
				{ ...sharedProps }
				as="button"
				onClick={ () => startTransition(() => action()) }
				type="button"
			>
				{ content }
			</Box>
		)
	}

	else if (route) {
		return (
			<Box
				{ ...sharedProps }
				as={ Link }
				attributes={ { aria: {
					current: isActive ? 'page' : undefined,
					label: typeof content === 'string' ? undefined : label,
				} } }
				href={ route }
				scroll={ true }
				shallow={ false }
			>
				{ content }
			</Box>
		)
	}

	return (
		<Box
			{ ...sharedProps }
			as={ as }
			tabIndex={ -1 }
		>
			{ content }
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
