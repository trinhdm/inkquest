'use client'

import { useProps, extractOtherProps } from '@/hooks/useProps'
import { useStyles } from '@/hooks/useStyles'
import { filterNavigation, type NavigationGroup } from '@/utils/navigation'
import { polymorphic } from '@/lib/component'
import { Box } from '@/components/polymorphic/Box'
import { Menu } from '../../Menu'
import classes from '../Footer.module.scss'

const NAME = 'FooterArea' as const

interface FooterAreaProps {
	items: readonly FooterNavGroup[]
}

interface FooterNavGroup
	extends NavigationGroup {
	location?: 'info' | 'legal'
}

interface FooterAreaSpecs {
	isCompound: true
	props: FooterAreaProps
}

export const FooterArea = polymorphic<FooterAreaSpecs>(_props => {
	const props = useProps(NAME, _props)
	const styles = useStyles('footer', { classes, props })

	const { children, items, ...rest } = props
	const { others } = extractOtherProps(rest)

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
					{ items.map(({ category, routes }) => {
						const menuItems = filterNavigation(routes, 'breadcrumbs')

						return (
							<div { ...styles('group') }>
								{ category && (
									<span { ...styles('label', true) }>{ category }</span>
								) }
								<Menu
									{ ...styles('menu') }
									hasDropdowns={ false }
									items={ menuItems }
								/>
							</div>
						)
					}) }
				</div>
			) }
		</Box>
	)
}, classes)

FooterArea.displayName = NAME
FooterArea.setDefaults({})

export declare namespace FooterArea {
	export type Props = FooterAreaProps
	export type Specs = FooterAreaSpecs
}
