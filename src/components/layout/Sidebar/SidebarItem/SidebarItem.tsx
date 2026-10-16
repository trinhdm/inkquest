import { usePathname } from 'next/navigation'
import { useSidebarCtx } from '../Sidebar.context'
import { extractOthers } from '@/hooks/useProps'
import { isAnchorLink } from '@/utils/helpers'
import { polymorphic } from '@/lib/component/factory'
import { Box } from '@/components/polymorphic/Box'
import { Button } from '@/components/core/Button'
import type { Route } from 'next'
import type { Sidebar } from '../Sidebar'
import classes from '../Sidebar.module.scss'

const NAME = 'SidebarItem' as const

interface SidebarActionItem {
	id: string
	label: string
	url?: never
}

interface SidebarLinkItem {
	id: string
	label: string
	url: Route
}

type SidebarItemProps =
	| SidebarActionItem
	| SidebarLinkItem

interface SidebarItemSpecs {
	context: Sidebar.Context
	isCompound: true
	props: SidebarItemProps
	selectors: SidebarItemSelectors
}

type SidebarItemSelectors =
	| 'item' | 'button'

const replaceUrl = (url: SidebarLinkItem['url']) =>
	(event: { preventDefault: () => void }) => {
		event.preventDefault()
		window.history.pushState(null, '', url)
	}

export const SidebarItem = polymorphic<SidebarItemSpecs>((_props, { useProps, useStyles }) => {
	const context = useSidebarCtx(NAME)
	const props = useProps(_props)
	const styles = useStyles({ context, props, withRootName: true })
	const pathname = usePathname()

	const { active, onChange, scroll, shallow } = context
	const { id, label, url, ...rest } = props
	const others = extractOthers(rest)

	const isActive = active === id,
		clsx = { selector: { active: isActive } }

	const outerProps = { ...styles(context.baseName, clsx), ...others, as: 'li' as const },
		innerProps = { ...styles('button'), unstyled: true }

	if (url) {
		//	a link to a section of this page is the current item in the list ("true"),
		//	not the current page ("page") - e.g. the legal pages' "On this page" sidebar
		const current = isAnchorLink(url, pathname) ? true : 'page'

		return (
			<Box { ...outerProps }>
				<Button
					{ ...innerProps }
					attributes={ {
						aria: { current: isActive ? current : undefined },
						data: { keep: label },
					} }
					href={ url }
					onNavigate={ event => {
						if (shallow) replaceUrl(url)(event)
						onChange?.(id)
					} }
					scroll={ scroll }
				>
					{ label }
				</Button>
			</Box>
		)
	}

	return (
		<Box { ...outerProps }>
			<Button
				{ ...innerProps }
				attributes={ {
					aria: { current: isActive || undefined },
					data: { keep: label },
				} }
				onClick={ () => onChange?.(id) }
			>
				{ label }
			</Button>
		</Box>
	)
}, { name: NAME, classes })

SidebarItem.set({ displayName: NAME })

export declare namespace SidebarItem {
	export type Props = SidebarItemProps
	export type Specs = SidebarItemSpecs

	export type Action = SidebarActionItem
	export type Link = SidebarLinkItem
}
