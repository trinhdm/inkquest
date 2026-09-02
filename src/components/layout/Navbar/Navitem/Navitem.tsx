import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useProps, useStyles } from '@/hooks'
import { useOutsideClick } from '@/hooks/useOutsideClick'
import { toKebabCase } from '@/utils/helpers'
import { Box, polymorphic } from '@/components/core/Box'
import { Button } from '@/components/core'
import { Icon } from '@/components/core/Icon'
import { Navmenu } from '../Navmenu'
import { NavRoute } from '@/utils/constants'
import classes from '../Navbar.module.scss'
import type { NavigationItem } from '@/utils/constants'
// import type { Route } from 'next'

const NAME = 'Navitem' as const,
	TAG = 'li' as const

interface NavitemProps extends NavigationItem {
	routes?: NavRoute[]
	// route: T
	// items?: NavitemProps<T>[]
	// label: string
}

interface NavitemSpecs {
	default: { component: typeof TAG }
	props: NavitemProps
}

export const Navitem = polymorphic<NavitemSpecs>(_props => {
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
		label,
		route,
		menu,
		routes,
		...rest
	} = props

	const hasDropdown = !!menu?.length,
		target = toKebabCase(label)

	const args = !!route
		? { as: Link, href: route }
		: { as: 'span' }

	// const args2 = route
	// 	? { href: route }
	// 	: {}

	const wrappedLabel = (
		<Box
			// as={ route ? Link : 'span' }
			{ ...args }
			role="menuitem"
			{ ...styles('label') }
		>
			{ label }
		</Box>
	)

	if (hasDropdown) {
		const menuID = `${target}-menu-list`
		const triggerID = `${target}-dropdown-trigger`

		useOutsideClick(itemRef, evt => {
			if (hasDropdown && isOpen) handleToggle(evt)
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
					<Navmenu
						attributes={ { aria: { labelledby: triggerID } } }
						id={ menuID }
						menu={ menu }
						routes={ routes }
					/>
				) }
			</Box>
		)
	}

	return (
		<Box
			as={ as }
			role="none"
			{ ...styles('root') }
			{ ...rest }
		>
			{ wrappedLabel }
		</Box>
	)
}, classes)

Navitem.displayName = NAME
Navitem.setDefaults({
	props: {
		as: TAG,
	}
})

export declare namespace Navitem {
	export type Props = NavitemProps
	export type Specs = NavitemSpecs
}
