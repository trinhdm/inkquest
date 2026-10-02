'use client'

import { extractOthers } from '@/hooks/useProps'
import { filterNavigation, type NavigationGroup } from '@/utils/navigation'
import { polymorphic } from '@/lib/component'
import { Box } from '@/components/polymorphic/Box'
import { Menu } from '../../Menu'
import type { Orientation } from '@/types/shared'
import classes from '../Footer.module.scss'

const NAME = 'Footer.Area' as const

interface FooterAreaProps {
	items: readonly FooterNavGroup[]
}

interface FooterNavGroup
	extends NavigationGroup {
	location?: 'info' | 'legal'
	orientation?: Orientation
}

interface FooterAreaSpecs {
	isCompound: true
	props: FooterAreaProps
	selectors: FooterSelectors
}

type FooterSelectors =
	| 'root' | 'wrapper'
	| 'content'
	| 'navigation' | 'group' | 'label' | 'menu'

export const FooterArea = polymorphic<FooterAreaSpecs>((_props, { useProps, useStyles }) => {
	const props = useProps(_props)
	const styles = useStyles({ name: 'footer', props })

	const { children, items, ...rest } = props
	const others = extractOthers(rest)

	return (
		<Box
			{ ...styles('wrapper', true) }
			{ ...others }
			as="div"
		>
			<div { ...styles('content') }>
				{ children }
			</div>

			{ !!items.length && (
				<div { ...styles('navigation') }>
					{ items.map(({ category, orientation, routes }) => {
						const menuItems = filterNavigation(routes, 'breadcrumbs')

						return (
							<div key={ `${category}-footer-group` } { ...styles('group') }>
								{ category && (
									<span { ...styles('label', true) }>{ category }</span>
								) }
								<Menu
									{ ...styles('menu') }
									hasDropdowns={ false }
									items={ menuItems }
									orientation={ orientation ?? 'vertical' }
								/>
							</div>
						)
					}) }
				</div>
			) }
		</Box>
	)
}, { name: NAME, classes })

FooterArea.setDefaults({})

export declare namespace FooterArea {
	export type Props = FooterAreaProps
	export type Specs = FooterAreaSpecs
}
