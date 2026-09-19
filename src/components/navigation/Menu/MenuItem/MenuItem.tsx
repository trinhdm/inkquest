import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
// import { usePathname } from 'next/navigation'
import { useProps, useStyles, useOutsideClick, extractOtherProps } from '@/hooks'
import { polymorphic, Box } from '@/components/polymorphic'
import { toKebabCase } from '@/utils/helpers'
import { Button, Icon } from '@/components/core'
import { Menu } from '../Menu'
import type { NavigationItem } from '@/utils/navigation'
import classes from '../Menu.module.scss'

const NAME = 'MenuItem' as const,
	DEFAULT_TAG = 'li' as const,
	MENUITEM_SELECTOR = ':scope > [role="none"] > [role="menuitem"]'

interface MenuItemProps extends NavigationItem {
	hasDropdowns?: boolean
}

interface MenuItemSpecs {
	defaults: { as: typeof DEFAULT_TAG }
	props: MenuItemProps
}

const getSubmenuItems = (root: HTMLLIElement | null) =>
	Array.from(
		root?.querySelector('[role="menubar"]')
			?.querySelectorAll<HTMLElement>(MENUITEM_SELECTOR) ?? []
	)

const MenuLabel = (
	item: NavigationItem,
	styles: ReturnType<typeof useStyles>
) => {
	const sharedProps = {
		role: 'menuitem',
		...styles('label'),
	}

	if (item.route) {
		return (
			<Box as={ Link } href={ item.route } { ...sharedProps }>
				{ item.label }
			</Box>
		)
	}

	return (
		<Box as="span" tabIndex={ -1 } { ...sharedProps }>
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
		hasDropdowns,
		label,
		menu,
		route,
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
				evt.stopPropagation()
				setIsOpen(true)
				requestAnimationFrame(() => getSubmenuItems(itemRef.current)[0]?.focus())
			}
			return
		}

		const items = getSubmenuItems(itemRef.current),
			currentIndex = items.findIndex(item => item === document.activeElement)

		switch (evt.key) {
			case 'ArrowDown':
			case 'ArrowUp': {
				evt.preventDefault()
				evt.stopPropagation()

				if (!items.length) return

				const step = evt.key === 'ArrowDown' ? 1 : -1
				const nextIndex = currentIndex === -1
					? (step === 1 ? 0 : items.length - 1)
					: (currentIndex + step + items.length) % items.length

				items[nextIndex]?.focus()
				break
			}
			case 'Escape':
				evt.stopPropagation()
				setIsOpen(false)
				itemRef.current?.querySelector<HTMLElement>(':scope > button')?.focus()
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
