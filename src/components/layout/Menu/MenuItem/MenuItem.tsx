import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useProps, useStyles, useOutsideClick } from '@/hooks'
import { toKebabCase } from '@/utils/helpers'
import { Box, polymorphic } from '@/components/core/Box'
import { Button, Icon } from '@/components/core'
import { Menu } from '../Menu'
import { NavRoute, type NavigationItem } from '@/utils/navigation'
import classes from '../Menu.module.scss'

const NAME = 'MenuItem' as const,
	DEFAULT_TAG = 'li' as const

interface MenuItemProps extends NavigationItem {
	hasDropdowns?: boolean
	routes?: NavRoute[]
	// route: T
	// items?: MenuItemProps<T>[]
	// label: string
}

interface MenuItemSpecs {
	default: { component: typeof DEFAULT_TAG }
	props: MenuItemProps
}

const MenuLabel = ({ label, route }: NavigationItem) => (
	<Box
		as={ route ? Link : 'span' }
		{ ...route ? { href: route } : {} }
		role="menuitem"
		// { ...styles('label') }
	>
		{ label }
	</Box>
)

export const MenuItem = polymorphic<MenuItemSpecs>(_props => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props })
	// add state to set tabIndex on keyboard navigation

	const timeoutRef = useRef<NodeJS.Timeout>(null)
	const itemRef = useRef<HTMLLIElement>(null)
	const [isOpen, setIsOpen] = useState(false)

	useEffect(() => {
		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current)
		}
	}, [])

	const handleToggle: React.MouseEventHandler<HTMLButtonElement> = evt => {
		evt.stopPropagation()
		setIsOpen(prevState => {
			if (!prevState) {
				console.log('idk', prevState)
			}
			return !prevState
		})
	}

	const handleMouseEnter = () => {
		if (timeoutRef.current) clearTimeout(timeoutRef.current)
		setIsOpen(true)
	}

	const handleMouseLeave = () => {
		timeoutRef.current = setTimeout(() => {
			console.log('is hover')
			setIsOpen(false)
		}, 300)
	}

	const {
		as,
		hasDropdowns,
		label,
		route,
		menu,
		routes,
		...rest
	} = props

	// console.log('item', { hasDropdowns })

	const isDropdown = !!menu?.length


	const wrappedLabel = (
		<Box
			as={ route ? Link : 'span' }
			{ ...route ? { href: route } : {} }
			role="menuitem"
			{ ...styles('label') }
		>
			{ label }
		</Box>
	)

	if (!isDropdown) {
		return (
			<Box
				as={ as }
				role="none"
				{ ...styles('root') }
				{ ...rest }
			>
				{/* { wrappedLabel } */}
				{ MenuLabel({ label, route }) }
			</Box>
		)
	}


	const target = toKebabCase(label),
		triggerID = `${target}-dropdown-trigger`,
		menuID = `${target}-menu-list`

	if (hasDropdowns) {
		useOutsideClick(itemRef, evt => {
			if (isOpen) handleToggle(evt)
		})

		return (
			<Box
				as={ as }
				ref={ itemRef }
				role="none"
				onMouseEnter={ handleMouseEnter }
				onMouseLeave={ handleMouseLeave }
				{ ...styles('root') }
				{ ...rest }
			>
				{/* { wrappedLabel } */}
				{ MenuLabel({ label, route }) }

				<Button
					unstyled
					id={ triggerID }
					onClick={ handleToggle }
					attributes={ { aria: {
						controls: menuID,
						expanded: isOpen,
						haspopup: 'true',
					} } }
					{ ...styles('trigger') }
				>
					<Icon
						attributes={ { aria: { hidden: true } } }
						type={ isOpen ? 'caret-up' : 'caret-down' }
					/>
				</Button>

				{ isOpen && (
					<Menu
						attributes={ { aria: { labelledby: triggerID } } }
						id={ menuID }
						menu={ menu }
						routes={ routes }
					/>
				) }
			</Box>
		)
	}



	return menu?.map(item => (
		<Box
			as={ DEFAULT_TAG }
			key={ item.label }
			role="none"
			{ ...styles('root') }
			{ ...rest }
			// { ...item }
		>
			{ MenuLabel(item) }
		</Box>
	))

	// return (
	// 	<Box
	// 		as={ as }
	// 		ref={ itemRef }
	// 		role="none"
	// 		{ ...styles('root') }
	// 		{ ...rest }
	// 	>
	// 		{ wrappedLabel }

	// 		<Button
	// 			unstyled
	// 			id={ triggerID }
	// 			attributes={ { aria: {
	// 				controls: menuID,
	// 				expanded: isOpen,
	// 				haspopup: 'true',
	// 			} } }
	// 			{ ...styles('trigger') }
	// 		>
	// 			<Icon
	// 				attributes={ { aria: { hidden: true } } }
	// 				type={ isOpen ? 'caret-up' : 'caret-down' }
	// 			/>
	// 		</Button>

	// 		<Menu
	// 			attributes={ { aria: { labelledby: triggerID } } }
	// 			id={ menuID }
	// 			menu={ menu }
	// 			routes={ routes }
	// 		/>
	// 	</Box>
	// )


}, classes)

MenuItem.displayName = NAME
MenuItem.setDefaults({
	props: {
		as: DEFAULT_TAG,
	}
})

export declare namespace MenuItem {
	export type Props = MenuItemProps
	export type Specs = MenuItemSpecs
}
