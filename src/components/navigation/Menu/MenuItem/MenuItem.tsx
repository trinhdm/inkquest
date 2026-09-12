import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
// import { usePathname } from 'next/navigation'
import { useProps, useStyles, useOutsideClick } from '@/hooks'
import { extractOtherProps, toKebabCase } from '@/utils/helpers'
import { Box, polymorphic } from '@/components/core/Box'
import { Button, Icon } from '@/components/core'
import { Menu } from '../Menu'
import type { NavigationItem } from '@/utils/navigation'
import classes from '../Menu.module.scss'

const NAME = 'MenuItem' as const,
	DEFAULT_TAG = 'li' as const

interface MenuItemProps extends NavigationItem {
	hasDropdowns?: boolean
}

interface MenuItemSpecs {
	defaults: { as: typeof DEFAULT_TAG }
	props: MenuItemProps
}

const MenuLabel = (item: NavigationItem, styles: ReturnType<typeof useStyles>) => {
	if (item.route) {
		return (
			<Box
				as={ Link }
				href={ item.route }
				role="menuitem"
				{ ...styles('label') }
			>
				{ item.label }
			</Box>
		)
	}

	return (
		<Box as="span" { ...styles('label') }>
			{ item.label }
		</Box>
	)
}

export const MenuItem = polymorphic<MenuItemSpecs>(_props => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props })
	// add behavior for:
	// aria-current="page": Marks the link of the active page
	// add state to set tabIndex on keyboard navigation

	const timeoutRef = useRef<NodeJS.Timeout>(null)
	const itemRef = useRef<HTMLLIElement>(null)
	const [isOpen, setIsOpen] = useState(false)

	useEffect(() => {
		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current)
		}
	}, [])

	const {
		// as,
		hasDropdowns,
		label,
		menu,
		route,
		routes,
		...rest
	} = props

	const { as, others } = extractOtherProps(rest)

	const isDropdown = !!menu?.length

	const handleToggle: React.MouseEventHandler<HTMLButtonElement> = evt => {
		evt.stopPropagation()
		setIsOpen(prevState => !prevState)
	}

	useOutsideClick(itemRef, evt => {
		if (hasDropdowns && isDropdown && isOpen)
			handleToggle(evt)
	})

	const handleMouseEnter = () => {
		if (timeoutRef.current) clearTimeout(timeoutRef.current)
		setIsOpen(true)
	}

	const handleMouseLeave = () => {
		timeoutRef.current = setTimeout(() => setIsOpen(false), 300)
	}

	const handleKeyDown: React.KeyboardEventHandler<HTMLLIElement> = evt => {
		if (!isOpen) {
			if (evt.key === 'ArrowDown' || evt.key === 'Enter' || evt.key === ' ') {
				evt.preventDefault()
				setIsOpen(true)
				requestAnimationFrame(() => {
					const firstItem = itemRef.current?.querySelector('[role="menubar"]')?.querySelector('[role="menuitem"]')
					if (firstItem instanceof HTMLElement) firstItem.focus()
				  })
			}
			return
		}

		if (!document.activeElement) return

		const items = Array.from(itemRef.current?.querySelectorAll('[role="menuitem"]') || []),
			currentIndex = items.indexOf(document.activeElement),
			nextItem = items[(currentIndex + 1) % items.length],
			prevItem = items[(currentIndex - 1 + items.length) % items.length]

		switch (evt.key) {
			case 'ArrowDown':
				evt.preventDefault()
				if (nextItem instanceof HTMLElement) nextItem.focus()
				break
			case 'ArrowUp':
				evt.preventDefault()
				if (prevItem instanceof HTMLElement) prevItem.focus()
				break
			case 'Escape':
				setIsOpen(false)
				itemRef.current?.querySelector('button')?.focus()
				break
			case 'Tab':
				setIsOpen(false)
				break
		}
	}

	const wrappedLabel = MenuLabel({ label, route }, styles)
	const sharedProps = {
		role: 'none',
		...styles('root'),
		...others,
	}

	if (!isDropdown) {
		return (
			<Box as={ as } { ...sharedProps }>
				{ wrappedLabel }
			</Box>
		)
	}

	if (!hasDropdowns) {
		return menu?.map(item => (
			<Box
				as={ DEFAULT_TAG }
				key={ item.label }
				{ ...sharedProps }
			>
				{ MenuLabel(item, styles) }
			</Box>
		))
	}

	const target = toKebabCase(label),
		triggerID = `${target}-dropdown-trigger`,
		menuID = `${target}-menu-list`

	return (
		<Box
			as={ as }
			ref={ itemRef }
			onKeyDown={ handleKeyDown }
			onMouseEnter={ handleMouseEnter }
			onMouseLeave={ handleMouseLeave }
			{ ...sharedProps }
		>
			{ wrappedLabel }

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
					items={ menu }
				/>
			) }
		</Box>
	)
}, classes)

MenuItem.displayName = NAME
MenuItem.setDefaults({ props: { as: DEFAULT_TAG } })

export declare namespace MenuItem {
	export type Props = MenuItemProps
	export type Specs = MenuItemSpecs
}
