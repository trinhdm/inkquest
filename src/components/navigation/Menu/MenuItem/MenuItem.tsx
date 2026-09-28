import { useEffect, useRef, useState } from 'react'
import { useOutsideClick } from '@/hooks/useOutsideClick'
import { useProps, extractOtherProps } from '@/hooks/useProps'
import { useStyles } from '@/hooks/useStyles'
import { polymorphic } from '@/lib/component'
import { toKebabCase } from '@/utils/helpers'
import { Box } from '@/components/polymorphic/Box'
import { Button, Icon } from '@/components/core'
import { Menu } from '../Menu'
import type { NavigationItem } from '@/utils/navigation'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import type { SpecAttributes } from '@/types/shared'
import Link from 'next/link'
import classes from '../Menu.module.scss'

const NAME = 'MenuItem' as const,
	TAG = 'li' as const,
	MENUITEM_SELECTOR = ':scope > [role="none"] > [role="menuitem"]'

const DEFAULT_PROPS = {
	as: TAG,
	hasDropdowns: true,
} as const

interface MenuItemProps
	extends NavigationItem {
	activeItem?: NavigationItem['route'] | null
	depth?: number
	hasDropdowns?: boolean
}

interface MenuItemSpecs {
	defaults: {
		as: typeof TAG
		props: PropsDefaultList<typeof DEFAULT_PROPS>
	}
	props: MenuItemProps
}

const getSubmenuItems = (root: HTMLLIElement | null) =>
	Array.from(
		root?.querySelector('[role="menubar"]')
			?.querySelectorAll<HTMLElement>(MENUITEM_SELECTOR) ?? []
	)

const isCurrentRoute = (
	item: NavigationItem,
	activeItem?: MenuItemProps['activeItem']
) => !!item.route && item.route === activeItem

const MenuLabel = (
	item: NavigationItem,
	styles: ReturnType<typeof useStyles>,
	isActive = false,
) => {
	const sharedProps = {
		...styles('label'),
		role: 'menuitem',
	}

	if (item.route) {
		return (
			<Box
				{ ...sharedProps }
				as={ Link }
				attributes={ { aria: { current: isActive ? 'page' : undefined } } }
				href={ item.route }
			>
				{ item.label }
			</Box>
		)
	}

	return (
		<Box { ...sharedProps } as="span" tabIndex={ -1 }>
			{ item.label }
		</Box>
	)
}

export const MenuItem = polymorphic<MenuItemSpecs>(_props => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props })

	const timeoutRef = useRef<NodeJS.Timeout>(null)
	const itemRef = useRef<HTMLLIElement>(null)
	const [isOpen, setIsOpen] = useState(false)

	useEffect(() => {
		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current)
		}
	}, [])

	const {
		activeItem,
		attributes,
		depth,
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

	const setAttributes = (isCurrent: boolean): SpecAttributes => ({
		...attributes,
		data: {
			...attributes?.data,
			current: isCurrent || attributes?.data?.current || null,
		},
	})

	const isActive = isCurrentRoute({ label, route }, activeItem),
		wrappedLabel = MenuLabel({ label, route }, styles, isActive)

	const sharedProps = {
		...styles('root'),
		...others,
		role: 'none',
	}

	if (!isDropdown) {
		return (
			<Box { ...sharedProps } as={ as } attributes={ setAttributes(isActive) }>
				{ wrappedLabel }
			</Box>
		)
	}

	if (!hasDropdowns) {
		return menu?.map(item => {
			const isCurrent = isCurrentRoute(item, activeItem)

			return (
				<Box
					{ ...sharedProps }
					as={ TAG }
					attributes={ setAttributes(isCurrent) }
					key={ item.label }
				>
					{ MenuLabel(item, styles, isCurrent) }
				</Box>
			)
		})
	}

	const target = toKebabCase(label),
		triggerID = `${target}-dropdown-trigger`,
		menuID = `${target}-menu-list`

	return (
		<Box
			{ ...sharedProps }
			as={ as }
			attributes={ setAttributes(isActive) }
			ref={ itemRef }
			onKeyDown={ handleKeyDown }
			onMouseEnter={ handleMouseEnter }
			onMouseLeave={ handleMouseLeave }
		>
			{ wrappedLabel }

			<Button
				{ ...styles('trigger') }
				unstyled
				attributes={ { aria: {
					controls: menuID,
					expanded: isOpen,
					haspopup: 'true',
				} } }
				onClick={ handleToggle }
				id={ triggerID }
			>
				<Icon
					attributes={ { aria: { hidden: true } } }
					type={ isOpen ? 'caret-up' : 'caret-down' }
				/>
			</Button>

			{ isOpen && (
				<Menu
					activeItem={ activeItem }
					attributes={ { aria: { labelledby: triggerID } } }
					depth={ typeof depth === 'number' ? depth + 1 : undefined }
					id={ menuID }
					items={ menu }
				/>
			) }
		</Box>
	)
}, classes)

MenuItem.displayName = NAME
MenuItem.setDefaults({ props: DEFAULT_PROPS })

export declare namespace MenuItem {
	export type Props = MenuItemProps
	export type Specs = MenuItemSpecs
}
