import {
	useEffect, useRef, useState,
	type KeyboardEventHandler, type MouseEventHandler,
} from 'react'

import { useOutsideClick } from '@/hooks/useOutsideClick'
import { deepMerge } from '@/utils/helpers'
import { extractOthers } from '@/hooks/useProps'
import { polymorphic } from '@/lib/component/factory'
import { Box } from '@/components/polymorphic/Box'
import { Button } from '@/components/core/Button'
import { Icon } from '@/components/core/Icon'
import { Menu } from '../Menu'
import type { MenuItem } from '../MenuItem'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import type { RequireSome } from '@/types/utils'
import classes from '../Menu.module.scss'

const NAME = 'Menu.Dropdown' as const,
	TAG = 'li' as const

const MENUITEM_SELECTOR = '[role="menuitem"]',
	MENU_ITEMS_SELECTOR = `:scope > ${MENUITEM_SELECTOR}`,
	SUBMENU_ITEMS_SELECTOR = `:scope > [role="none"] > ${MENUITEM_SELECTOR}`

const DEFAULT_PROPS = {
	as: TAG,
} as const

interface MenuDropdownProps
	extends RequireSome<Omit<MenuItem.Props, 'action' | 'hasDropdowns' | 'route'>, 'menu'> {
	hasCaret?: boolean
	id: string
}

interface MenuDropdownSpecs {
	defaults: {
		as: typeof TAG
		props: PropsDefaultList<typeof DEFAULT_PROPS>
	}
	props: MenuDropdownProps
	selectors: MenuDropdownSelectors
}

type MenuDropdownSelectors =
	| 'root' | 'list'
	| 'trigger' | 'icon'

const getSubmenuItems = (root: HTMLLIElement | null) =>
	Array.from(
		root?.querySelector('[role="menubar"]')
			?.querySelectorAll<HTMLElement>(SUBMENU_ITEMS_SELECTOR) ?? []
	)

export const MenuDropdown = polymorphic<MenuDropdownSpecs>((_props, { useProps, useStyles }) => {
	const props = useProps(_props)
	const styles = useStyles({ props })

	const {
		active, as, attributes,
		className, depth, hasCaret,
		id, label, menu, trigger,
		...rest
	} = props

	const others = extractOthers(rest)
	const isNested = !!depth

	const [isOpen, setIsOpen] = useState(false)
	const itemRef = useRef<HTMLLIElement>(null)
	const timeoutRef = useRef<NodeJS.Timeout>(null)

	useEffect(() => {
		return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }
	}, [])

	const handleToggle: MouseEventHandler<HTMLButtonElement> = event => {
		event.stopPropagation()
		setIsOpen(prev => !prev)
	}

	useOutsideClick(itemRef, event => {
		if (isOpen) handleToggle(event)
	})

	const handleMouseEnter = () => {
		if (timeoutRef.current) clearTimeout(timeoutRef.current)
		setIsOpen(true)
	}

	const handleMouseLeave = () => {
		timeoutRef.current = setTimeout(() => setIsOpen(false), 300)
	}

	const handleKeyDown: KeyboardEventHandler<HTMLLIElement> = event => {
		const { key } = event,
			onLink = event.target instanceof HTMLAnchorElement,
			item = itemRef.current

		const closeKeys = ['Escape', ...(isNested ? ['ArrowLeft'] : [])],
			openKeys = [isNested ? 'ArrowRight' : 'ArrowDown', ...(onLink ? [] : [' ', 'Enter'])]

		const closes = closeKeys.includes(key),
			opens = openKeys.includes(key)

		if (!isOpen) {
			if (!opens) return

			event.preventDefault()
			event.stopPropagation()

			setIsOpen(true)
			requestAnimationFrame(() => getSubmenuItems(item)[0]?.focus())
			return
		}

		if (closes) {
			event.stopPropagation()

			setIsOpen(false)
			item?.querySelector<HTMLElement>(MENU_ITEMS_SELECTOR)?.focus()
			return
		}

		const submenu = getSubmenuItems(item),
			current = submenu.findIndex(el => el === document.activeElement),
			total = submenu.length

		switch (key) {
			case 'ArrowDown':
			case 'ArrowUp': {
				event.preventDefault()
				event.stopPropagation()

				if (!total) return

				const step = key === 'ArrowDown' ? 1 : -1
				const next = current === -1
					? (step === 1 ? 0 : total - 1)
					: (current + step + total) % total

				submenu[next]?.focus()
				break
			}
			case 'Tab':
				setIsOpen(false)
				break
		}
	}

	const content = trigger ?? label,
		showCaret = typeof hasCaret === 'boolean'
			? hasCaret : typeof content === 'string'

	const baseAttrs = attributes ?? {},
		dataAttrs = { data: { open: isOpen || undefined } }

	const menuID = `${id}-menu`,
		triggerID = `${id}-trigger`

	return (
		<Box
			{ ...styles('root') }
			{ ...others }
			as={ as }
			attributes={ deepMerge(baseAttrs, dataAttrs) }
			id={ id }
			onKeyDown={ handleKeyDown }
			onMouseEnter={ handleMouseEnter }
			onMouseLeave={ handleMouseLeave }
			ref={ itemRef }
			role="none"
		>
			{ content }

			<Button
				{ ...styles('trigger', { selector: { hidden: !showCaret } }) }
				unstyled
				attributes={ { aria: {
					controls: menuID,
					expanded: isOpen,
					haspopup: 'true',
					label: `${label} submenu`,
				} } }
				id={ triggerID }
				onClick={ handleToggle }
			>
				<Icon { ...styles('icon') } type="caret-down" />
			</Button>

			<Menu
				active={ active }
				attributes={ { aria: {
					labelledby: triggerID,
				} } }
				className={ className }
				depth={ typeof depth === 'number' ? depth + 1 : undefined }
				id={ menuID }
				items={ menu }
			/>
		</Box>
	)
}, { name: NAME, classes })

MenuDropdown.set({
	defaultProps: DEFAULT_PROPS,
	displayName: NAME,
})

export declare namespace MenuDropdown {
	export type Props = MenuDropdownProps
	export type Specs = MenuDropdownSpecs
}
