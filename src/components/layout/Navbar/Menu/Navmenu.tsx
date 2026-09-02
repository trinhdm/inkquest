import { Box, polymorphic } from '@/components/core/Box'
import { useProps, useStyles } from '@/hooks'
import { useState, type ReactElement, type ReactNode } from 'react'
import classes from '../Navbar.module.scss'
import { Button } from '@/components/core'
import { Navitem } from '../Item'

const NAME = 'Navmenu' as const,
	TAG = 'div' as const

interface NavmenuProps {
	children: ReactNode
	items: ReactElement[]
	onClose?: () => void
	onToggle?: () => void
	trigger: ReactNode
}

interface NavmenuSpecs {
	// cssVars: { root: NavmenuVars }
	default: { component: typeof TAG }
	props: NavmenuProps
}

export const Navmenu = polymorphic<NavmenuSpecs>(_props => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props })

	const [open, setOpen] = useState(false)
	const handleClose = () => setOpen(false)

	const {
		as,
		children,
		items,
		trigger,
		...rest
	} = props
	console.log(items)

	return (
		<Box
			as={ as }
			{ ...styles('root') }
			{ ...rest }
		>
			<Button unstyled { ...styles('trigger') }>
				{ trigger }
			</Button>
			<ul>
				{ children }
				{ items && items.length > 1 && (
					<Box as="ul">
						{ items.map(item => <Box key={ item.label } as={ Navitem } { ...item } />) }
					</Box>
				) }
			</ul>
		</Box>
	)
}, classes)

Navmenu.displayName = NAME
Navmenu.setDefaults({
	props: {
		as: TAG,
	}
})

export declare namespace Navmenu {
	export type Props = NavmenuProps
	export type Specs = NavmenuSpecs
}
