import { defineTokens } from '@/lib/component/tokens'
import { extractOthers } from '@/hooks/useProps'
import { polymorphic } from '@/lib/component/factory'
import { rem } from '@/lib/general'
import { Box } from '@/components/polymorphic/Box'
import { Button } from '@/components/core/Button'
import type { ReactNode } from 'react'
import type { Route } from 'next'
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
	tokens: SidebarTokens
}

type SidebarSelectors =
	| 'root' | 'inner' | 'wrapper'
	| 'label' | 'highlight'
	| 'button' | 'item'

type SidebarTokens = {
	highlight:
		| '--sidebar-highlight-height'
		| '--sidebar-highlight-position'
}

const replaceUrl = (url: SidebarLinkItem['url']) =>
	(event: { preventDefault: () => void }) => {
		event.preventDefault()
		window.history.pushState(null, '', url)
	}

const tokens = defineTokens<SidebarSpecs>()(({ props }) => {
	const { active, items } = props
	if (!items?.length) return {}

	// TODO: when `active` is missing or matches no item, `activeIndex` is -1, so the
	// rail is drawn one row ABOVE the list (`--sidebar-rail-position: -3rem`) at full
	// opacity. A linked sidebar may omit `active`, so this is reachable. Return no rail
	// tokens, or hide the rail, when `activeIndex < 0`. See `it.todo` in Sidebar.test.tsx.
	const activeIndex = items.findIndex(item => active === item.id),
		height = 48

	return {
		highlight: {
			'--sidebar-highlight-height': rem(height),
			'--sidebar-highlight-position': rem(height * activeIndex),
		},
	}
})

export const Sidebar = polymorphic<SidebarSpecs>((_props, { useProps, useStyles }) => {
	const props = useProps(_props)
	const styles = useStyles({ props, tokens })

	const {
		as, active, children,
		items, label, onChange,
		scroll, shallow, sticky,
		...rest
	} = props

	const others = extractOthers(rest)
	const hasItems = !!items?.length

	const clsx = { selector: { nav: hasItems, sticky }}
	const sharedProps = { ...styles('root', clsx), ...others, as }

	if (hasItems) {
		return (
			<Box { ...sharedProps }>
				{ label && <span { ...styles('label') }>{ label }</span> }

				<nav { ...styles('wrapper') }>
					<span { ...styles('highlight') } />
					<ul { ...styles('inner') } role="menu">
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
