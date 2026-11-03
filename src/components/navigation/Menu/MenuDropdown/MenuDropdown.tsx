import {
	useEffect, useRef, useState,
	type KeyboardEventHandler, type MouseEventHandler,
	type ReactNode,
} from 'react'

import { useOutsideClick } from '@/hooks/useOutsideClick'
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
	TAG = 'li' as const,
	MENUITEM_SELECTOR = ':scope > [role="none"] > [role="menuitem"]'

const DEFAULT_PROPS = {
	as: TAG,
	hasCaret: true,
} as const

interface MenuDropdownProps
	extends RequireSome<Pick<MenuItem.Props, 'active' | 'depth' | 'menu'>, 'menu'> {
	hasCaret?: boolean
	id: string
	label: ReactNode
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
			?.querySelectorAll<HTMLElement>(MENUITEM_SELECTOR) ?? []
	)

export const MenuDropdown = polymorphic<MenuDropdownSpecs>((_props, { useProps, useStyles }) => {
	const props = useProps(_props)
	const styles = useStyles({ props })

	const {
		active, as, attributes,
		depth, hasCaret, id,
		label, menu,
		...rest
	} = props

	const others = extractOthers(rest)

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
		const { key }  = event

		if (!isOpen) {
			if (key === 'ArrowDown' || key === 'Enter' || key === ' ') {
				event.preventDefault()
				event.stopPropagation()
				setIsOpen(true)
				requestAnimationFrame(() => getSubmenuItems(itemRef.current)[0]?.focus())
			}
			return
		}

		const items = getSubmenuItems(itemRef.current),
			currentIndex = items.findIndex(item => item === document.activeElement)

		switch (key) {
			case 'ArrowDown':
			case 'ArrowUp': {
				event.preventDefault()
				event.stopPropagation()

				if (!items.length) return

				const step = key === 'ArrowDown' ? 1 : -1
				const nextIndex = currentIndex === -1
					? (step === 1 ? 0 : items.length - 1)
					: (currentIndex + step + items.length) % items.length

				items[nextIndex]?.focus()
				break
			}
			case 'Escape':
				event.stopPropagation()
				setIsOpen(false)
				itemRef.current?.querySelector<HTMLElement>(':scope > button')?.focus()
				break
			case 'Tab':
				setIsOpen(false)
				break
		}
	}

	const menuID = `${id}-menu`,
		triggerID = `${id}-trigger`

	return (
		<Box
			{ ...styles('root') }
			{ ...others }
			as={ as }
			attributes={ attributes }
			id={ id }
			ref={ itemRef }
			onKeyDown={ handleKeyDown }
			onMouseEnter={ handleMouseEnter }
			onMouseLeave={ handleMouseLeave }
			role="none"
		>
			<Button
				{ ...styles('trigger', { selector: { open: isOpen } }) }
				unstyled
				attributes={ { aria: {
					controls: menuID,
					expanded: isOpen,
					haspopup: 'true',
				} } }
				id={ triggerID }
				onClick={ handleToggle }
			>
				{ label }
				{ hasCaret && <Icon { ...styles('icon') } type="caret-down" /> }
			</Button>

			<Menu
				active={ active }
				attributes={ {
					aria: { labelledby: triggerID },
					data: { open: isOpen || undefined },
				} }
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
