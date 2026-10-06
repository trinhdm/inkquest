import { defineTokens, polymorphic } from '@/lib/component'
import { extractOthers } from '@/hooks/useProps'
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
} as const

interface BaseSidebarProps {
	children?: ReactNode
}

interface BaseSidebarItem {
	id: string
	label: string
}

interface SidebarActionItem
	extends BaseSidebarItem {
	url?: never
}

interface SidebarLinkItem
	extends BaseSidebarItem {
	url: Route<string>
}

interface ActionSidebarProps {
	active: string
	items: SidebarActionItem[]
	onChange: (id: string) => void
	scroll?: never
	shallow?: never
}

interface LinkedSidebarProps {
	active?: string
	items: SidebarLinkItem[]
	onChange?: never
	scroll?: Button.Props['scroll']
	shallow?: boolean
}

interface DisplaySidebarProps {
	active: never
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
	tokens: SidebarTokens
}

type SidebarSelectors =
	| 'root' | 'inner' | 'wrapper' | 'rail'
	| 'button' | 'item'

type SidebarTokens = {
	rail:
		| '--sidebar-rail-height'
		| '--sidebar-rail-position'
}

const tokens = defineTokens<SidebarSpecs>()(({ props }) => {
	const { active, items } = props
	if (!items?.length) return {}

	const activeIndex = items.findIndex(item => active === item.id)
	const height = 48

	return {
		rail: {
			'--sidebar-rail-height': rem(height),
			'--sidebar-rail-position': rem(height * activeIndex),
		},
	}
})

const replaceUrl = (url: SidebarLinkItem['url']) =>
	(event: { preventDefault: () => void }) => {
		event.preventDefault()
		window.history.pushState(null, '', url)
	}

export const Sidebar = polymorphic<SidebarSpecs>((_props, { useProps, useStyles }) => {
	const props = useProps(_props)
	const styles = useStyles({ props, tokens })

	const {
		as,
		active,
		children,
		items,
		onChange,
		scroll,
		shallow,
		...rest
	} = props

	const others = extractOthers(rest)
	const sharedProps = { ...styles('root'), ...others, as }

	if (items) {
		return (
			<Box { ...sharedProps }>
				<nav { ...styles('inner') }>
					<span { ...styles('rail') } />
					<ul { ...styles('wrapper') } role="menu">
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
											onNavigate={ shallow ? replaceUrl(url) : undefined }
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
			<div { ...styles('inner') }>
				<div { ...styles('wrapper') }>
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
