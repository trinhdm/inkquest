import {
	useLayoutEffect, useMemo, useRef, useState,
	type CSSProperties, type ReactNode,
} from 'react'

import { extractOthers } from '@/hooks/useProps'
import { polymorphic } from '@/lib/component/factory'
import { rem } from '@/lib/general'
import { Box } from '@/components/polymorphic/Box'
import { Button } from '@/components/core/Button'
import { SidebarItem } from './SidebarItem'
import { SidebarProvider, type SidebarContext } from './Sidebar.context'
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

const SUBCOMPONENTS = {
	Item: SidebarItem,
} as const

interface BaseSidebarProps {
	children?: ReactNode
	label?: string
	sticky?: boolean
}

interface ActionSidebarProps {
	active: string
	items: SidebarItem.Action[]
	onChange: (id: string) => void
	scroll?: never
	shallow?: never
}

interface LinkedSidebarProps {
	active?: string
	items: SidebarItem.Link[]
	onChange?: (id: string) => void
	scroll?: Button.Props['scroll']
	shallow?: boolean
}

interface DisplaySidebarProps {
	active?: never
	items?: never
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
	subcomponents: typeof SUBCOMPONENTS
}

type SidebarSelectors =
	| 'root' | 'inner' | 'wrapper'
	| 'label' | 'highlight'
	| 'button' | 'item'

//	where the highlight sits: the active row's offset from the top of the list (in rem),
//	and how far to stretch the highlight's own height to cover the row
interface SidebarHighlight {
	scale: number
	top: string
}

export const Sidebar = polymorphic<SidebarSpecs>((_props, { useProps, useStyles }) => {
	const props = useProps(_props)
	const styles = useStyles({ props })

	const {
		as, active, children,
		items, label, onChange,
		scroll, shallow, sticky,
		unstyled,
		...rest
	} = props

	const others = extractOthers(rest)

	const [highlight, setHighlight] = useState<SidebarHighlight | null>(null)
	const highlightRef = useRef<HTMLSpanElement>(null),
		listRef = useRef<HTMLUListElement>(null)

	const ctxValues = useMemo(() => ({
		active, onChange, scroll, shallow, unstyled,
	}), [active, onChange, scroll, shallow, unstyled])

	const activeIndex = items?.findIndex(item => (item.id === active)) ?? -1

	const hasItems = !!items?.length,
		itemCount = items?.length ?? 0

	//	measure the active row, so the highlight fits labels that wrap onto more lines;
	//	re-measure whenever a row resizes (fonts loading, the sidebar narrowing, bold text wrapping)
	useLayoutEffect(() => {
		const list = listRef.current,
			base = highlightRef.current

		if (!list || !base) return

		//	the highlight keeps its CSS height and is stretched with `scaleY`, so moving it never triggers layout
		const measure = () => {
			const row = list.children[activeIndex] as HTMLElement | undefined
			const next = row ? {
				scale: base.offsetHeight ? row.offsetHeight / base.offsetHeight : 1,
				top: rem(list.offsetTop + row.offsetTop),
			} : null

			setHighlight(prev => (
				prev?.scale === next?.scale && prev?.top === next?.top ? prev : next
			))
		}

		measure()

		const observer = new ResizeObserver(measure)
		observer.observe(list)
		Array.from(list.children).forEach(row => observer.observe(row))

		return () => observer.disconnect()
	}, [activeIndex, itemCount])

	const clsx = { selector: { nav: hasItems, sticky } }
	const sharedProps = { ...styles('root', clsx), ...others, as, unstyled }

	if (hasItems) {
		const highlightStyles = styles('highlight'),
			isMenu = Object.hasOwn(items[0], 'url'),
			role = isMenu ? 'menu' : undefined

		return (
			<Box { ...sharedProps }>
				{ label && <span { ...styles('label') }>{ label }</span> }

				<nav { ...styles('wrapper') }>
					<span
						{ ...highlightStyles }
						ref={ highlightRef }
						style={ {
							...highlightStyles.style,
							...(highlight ? {
								'--sidebar-highlight-position': highlight.top,
								'--sidebar-highlight-scale': highlight.scale,
							} : { visibility: 'hidden' }),
						} as CSSProperties & CSSVars }
					/>

					<SidebarProvider value={ ctxValues }>
						<ul { ...styles('inner') } ref={ listRef } role={ role }>
							{ items.map(item => <SidebarItem key={ item.id } { ...item } />) }
						</ul>
					</SidebarProvider>
				</nav>
			</Box>
		)
	}

	return (
		<Box { ...sharedProps }>
			{ label && <span { ...styles('label') }>{ label }</span> }

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
	subcomponents: SUBCOMPONENTS,
})

export declare namespace Sidebar {
	export type Context = SidebarContext
	export type Props = SidebarProps
	export type Specs = SidebarSpecs

	export namespace Item {
		export type Props = SidebarItem.Props
		export type Specs = SidebarItem.Specs

		export type Action = SidebarItem.Action
		export type Link = SidebarItem.Link
	}
}
