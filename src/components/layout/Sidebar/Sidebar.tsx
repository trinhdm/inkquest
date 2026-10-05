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
	onItemChange: (id: string) => void
	scroll?: never
	shallow?: never
}

interface LinkedSidebarProps {
	active?: string
	items: SidebarLinkItem[]
	onItemChange?: never
	scroll?: Button.Props['scroll']
	shallow?: boolean
}

type SidebarNavProps =
	| ActionSidebarProps
	| LinkedSidebarProps

type SidebarProps =
	& BaseSidebarProps
	& SidebarNavProps
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
	const activeIndex = items.findIndex(item => active === item.id)
	const height = 48

	return {
		rail: {
			'--sidebar-rail-height': rem(height),
			'--sidebar-rail-position': rem(height * activeIndex),
		},
	}
})

export const Sidebar = polymorphic<SidebarSpecs>((_props, { useProps, useStyles }) => {
	const props = useProps(_props)
	const styles = useStyles({ props, tokens })

	const {
		as,
		active,
		children,
		items,
		onItemChange,
		scroll,
		shallow,
		...rest
	} = props

	const others = extractOthers(rest)

	const replaceUrl = (url: SidebarLinkItem['url']) => (event: { preventDefault: () => void }) => {
		event.preventDefault()
		window.history.pushState(null, '', url)
	}

	return (
		<Box
			{ ...styles('root') }
			{ ...others }
			as={ as }
		>
			<nav { ...styles('inner') }>
				<span { ...styles('rail') } />
				<ul { ...styles('wrapper') } role="menu">
					{ items.map(({ id, label, url }) => {
						const isActive = active === id,
							selector = { active: isActive }
						const itemProps = { ...styles('button'), unstyled: true }

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
										onClick={ () => onItemChange?.(id) }
									>
										{ label }
									</Button>
								) }
							</li>
						)
					}) }
				</ul>
			</nav>
			{ children }
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
