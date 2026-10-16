import {
	useLayoutEffect, useRef, useState,
	type CSSProperties, type ReactNode,
} from 'react'

import { extractOthers } from '@/hooks/useProps'
import { polymorphic } from '@/lib/component/factory'
import { rem } from '@/lib/general'
import { Box } from '@/components/polymorphic/Box'
import { Button } from '@/components/core/Button'
import type { Route } from 'next'
import type { CSSVars } from '@/types/shared'
import type { MaybeAnimationProps } from '@/hooks/animation'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import classes from './Sidebar.module.scss'

const NAME = 'Sidebar' as const,
	TAG = 'aside' as const

const DEFAULT_PROPS = {
	as: TAG,
	scroll: false,
	shallow: true,
	sticky: true,
} as const

interface BaseSidebarProps {
	children?: ReactNode
	sticky?: boolean
}

interface BaseSidebarItem {
	id: string
	label: string
}

interface SidebarActionItem
	extends BaseSidebarItem {
	url?: never
}

interface ActionSidebarProps {
	active: string
	items: SidebarActionItem[]
	label?: string
	onChange: (id: string) => void
	scroll?: never
	shallow?: never
}

interface SidebarLinkItem
	extends BaseSidebarItem {
	url: Route<string>
}

interface LinkedSidebarProps {
	active?: string
	items: SidebarLinkItem[]
	label?: string
	onChange?: (id: string) => void
	scroll?: Button.Props['scroll']
	shallow?: boolean
}

interface DisplaySidebarProps {
	active: never
	items?: never
	label?: never
	onChange?: never
	scroll?: never
	shallow?: never
}

type SidebarLayoutProps =
	| ActionSidebarProps
	| DisplaySidebarProps
	| LinkedSidebarProps

type SidebarProps =
	& BaseSidebarProps
	& SidebarLayoutProps
	& MaybeAnimationProps

interface SidebarSpecs {
	defaults: {
		as: typeof TAG
		props: PropsDefaultList<typeof DEFAULT_PROPS>
	}
	props: SidebarProps
	selectors: SidebarSelectors
}

type SidebarSelectors =
	| 'root' | 'inner' | 'wrapper'
	| 'label' | 'highlight'
	| 'button' | 'item'

interface SidebarHighlight {
	height: `${number}rem`
	top: `${number}rem`
}

const replaceUrl = (url: SidebarLinkItem['url']) =>
	(event: { preventDefault: () => void }) => {
		event.preventDefault()
		window.history.pushState(null, '', url)
	}

export const Sidebar = polymorphic<SidebarSpecs>((_props, { useProps, useStyles }) => {
	const props = useProps(_props)
	const styles = useStyles({ props })

	const {
		as, active, children,
		items, label, onChange,
		scroll, shallow, sticky,
		...rest
	} = props

	const others = extractOthers(rest)

	const [highlight, setHighlight] = useState<SidebarHighlight | null>(null)
	const listRef = useRef<HTMLUListElement>(null)

	const activeIndex = items?.findIndex(item => item.id === active) ?? -1,
		hasItems = !!items?.length,
		itemCount = hasItems ?? 0

	//	measure the active row, so the highlight fits labels that wrap onto more lines;
	//	re-measure whenever a row resizes (fonts loading, the sidebar narrowing, bold text wrapping)
	useLayoutEffect(() => {
		const list = listRef.current
		if (!list) return

		const measure = () => {
			const row = list.children[activeIndex] as HTMLElement | undefined
			let next: SidebarHighlight | null = null

			if (row) {
				const height = rem(row.offsetHeight),
					top = rem(list.offsetTop + row.offsetTop)
				next = { height, top }
			}

			setHighlight(prev => (
				prev?.height === next?.height && prev?.top === next?.top ? prev : next
			))
		}

		measure()

		const observer = new ResizeObserver(measure)
		observer.observe(list)
		Array.from(list.children).forEach(row => observer.observe(row))

		return () => observer.disconnect()
	}, [activeIndex, itemCount])

	const clsx = { selector: { nav: hasItems, sticky }}
	const sharedProps = { ...styles('root', clsx), ...others, as }

	if (hasItems) {
		const highlightStyles = styles('highlight')

		return (
			<Box { ...sharedProps }>
				{ label && <span { ...styles('label') }>{ label }</span> }

				<nav { ...styles('wrapper') }>
					{ highlight && (
						<span
							{ ...highlightStyles }
							style={ {
								...highlightStyles.style,
								'--sidebar-highlight-height': highlight.height,
								'--sidebar-highlight-position': highlight.top,
							} as CSSProperties & CSSVars }
						/>
					) }
					<ul { ...styles('inner') } ref={ listRef } role="menu">
						{ items.map(({ id, label, url }) => {
							const itemProps = { ...styles('button'), unstyled: true }
							const isActive = active === id,
								selector = { active: isActive }

							return (
								<li key={ `sidebar-item-${id}` } { ...styles('item', { selector }) }>
									{ url ? (
										<Button
											{ ...itemProps }
											attributes={ { aria: { current: isActive ? 'page' : undefined } } }
											href={ url }
											onNavigate={ event => {
												if (shallow) replaceUrl(url)(event)
												onChange?.(id)
											} }
											scroll={ scroll }
										>
											{ label }
										</Button>
									) : (
										<Button
											{ ...itemProps }
											attributes={ { aria: { current: isActive || undefined } } }
											onClick={ () => onChange?.(id) }
										>
											{ label }
										</Button>
									) }
								</li>
							)
						}) }
					</ul>
				</nav>
			</Box>
		)
	}

	return (
		<Box { ...sharedProps }>
			<div { ...styles('wrapper') }>
				<div { ...styles('inner') }>
					{ children }
				</div>
			</div>

		</Box>
	)
}, { name: NAME, classes })

Sidebar.set({
	defaultProps: DEFAULT_PROPS,
	displayName: NAME,
})

export declare namespace Sidebar {
	export type Props = SidebarProps
	export type Specs = SidebarSpecs

	export type ActionItem = SidebarActionItem
	export type LinkItem = SidebarLinkItem
}
