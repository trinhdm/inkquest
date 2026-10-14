import {
	useEffect, useRef, useState,
	type KeyboardEventHandler, type MouseEventHandler,
} from 'react'

import { useOutsideClick } from '@/hooks/useOutsideClick'
import { extractOthers } from '@/hooks/useProps'
import { polymorphic } from '@/lib/component/factory'
import { toKebabCase } from '@/utils/helpers'
import { Box } from '@/components/polymorphic/Box'
import { Button } from '@/components/core/Button'
import { Icon } from '@/components/core/Icon'
import { Menu } from '../Menu'
import { MenuLabel } from '../MenuLabel'
import type { NavigationItem } from '@/utils/navigation'
import type { PropsDefaultList } from '@/lib/component/factory/types'
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
	active?: NavigationItem['route'] | null
	depth?: number
	hasDropdowns?: boolean
}

interface MenuItemSpecs {
	defaults: {
		as: typeof TAG
		props: PropsDefaultList<typeof DEFAULT_PROPS>
	}
	props: MenuItemProps
	selectors: MenuItemSelectors
}

type MenuItemSelectors =
	| 'root' | 'label' | 'trigger'

const getSubmenuItems = (root: HTMLLIElement | null) =>
	Array.from(
		root?.querySelector('[role="menubar"]')
			?.querySelectorAll<HTMLElement>(MENUITEM_SELECTOR) ?? []
	)

const isCurrentRoute = (item: NavigationItem, active?: MenuItemProps['active']) =>
	!!item.route && item.route === active

export const MenuItem = polymorphic<MenuItemSpecs>((_props, { useProps, useStyles }) => {
	const props = useProps(_props)
	const styles = useStyles({ props })

	const [isOpen, setIsOpen] = useState(false)
	const itemRef = useRef<HTMLLIElement>(null)
	const timeoutRef = useRef<NodeJS.Timeout>(null)

	useEffect(() => {
		return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }
	}, [])

	const {
		active, as, attributes,
		depth, hasDropdowns, label,
		menu, route,
		...rest
	} = props

	const others = extractOthers(rest)
	const isDropdown = !!menu?.length

	const handleToggle: MouseEventHandler<HTMLButtonElement> = evt => {
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

	const handleKeyDown: KeyboardEventHandler<HTMLLIElement> = evt => {
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

	const setAttributes = (isCurrent: boolean) => ({
		...attributes,
		data: {
			...attributes?.data,
			current: isCurrent || attributes?.data?.current || null,
		},
	})

	const isActive = isCurrentRoute({ label, route }, active),
		labelEl = <MenuLabel isActive={ isActive } item={ { label, route } } />

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
			const isCurrent = isCurrentRoute(item, active)

			return (
				<Box
					{ ...sharedProps }
					attributes={ setAttributes(isCurrent) }
					key={ item.label }
				>
					<MenuLabel isActive={ isCurrent } item={ item } />
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
			attributes={ setAttributes(isActive) }
			ref={ itemRef }
			onKeyDown={ handleKeyDown }
			onMouseEnter={ handleMouseEnter }
			onMouseLeave={ handleMouseLeave }
		>
			{ labelEl }

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
				<Icon hidden type={ isOpen ? 'caret-up' : 'caret-down' } />
			</Button>

			{ isOpen && (
				<Menu
					active={ active }
					attributes={ { aria: { labelledby: triggerID } } }
					depth={ typeof depth === 'number' ? depth + 1 : undefined }
					id={ menuID }
					items={ menu }
				/>
			) }
		</Box>
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
