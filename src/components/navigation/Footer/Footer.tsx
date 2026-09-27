'use client'

import { useProps, extractOtherProps } from '@/hooks/useProps'
import { useStyles } from '@/hooks/useStyles'
import { filterNavigation, listRoutesWithSlug, type NavigationGroup } from '@/utils/navigation'
import { polymorphic } from '@/lib/component'
import { Box } from '@/components/polymorphic/Box'
import { Menu } from '../Menu'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import classes from './Footer.module.scss'

const NAME = 'Footer' as const,
	TAG = 'footer' as const

const BASE_FOOTER_NAV: FooterNavGroup[] = [
	{
		category: 'Discover',
		routes: listRoutesWithSlug('/discover'),
	},
	{
		category: 'Marketplace',
		routes: listRoutesWithSlug('/marketplace'),
	},
	{
		category: 'Community',
		routes: listRoutesWithSlug('/community'),
	},
	{
		category: 'Company',
		routes: ['/about', '/faqs', '/careers', '/press'],
	},
	{
		routes: ['/privacy-policy', '/terms-conditions', '/cookies'],
		location: 'legal',
	},
] as const

const DEFAULT_PROPS = {
	as: TAG,
	items: BASE_FOOTER_NAV
} as const

interface FooterProps {
	items: readonly FooterNavGroup[]
}
interface FooterNavGroup
	extends NavigationGroup {
	location?: 'info' | 'legal'
}

interface FooterSpecs {
	defaults: {
		as: typeof TAG
		props: PropsDefaultList<typeof DEFAULT_PROPS>
	}
	props: FooterProps
}

export const Footer = polymorphic<FooterSpecs>(_props => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props })

	const { children, items, ...rest } = props
	const { as, others } = extractOtherProps(rest)
	const wrapperStyles = styles('wrapper', true)

	const infoItems = items.filter(item => !item.location || item.location === 'info'),
		legalItems = items.filter(item => item.location === 'legal')

	return (
		<Box
			{ ...styles('root') }
			{ ...others }
			as={ as }
		>
			<div { ...styles('info') }>
				<div { ...wrapperStyles }>
					<div { ...styles('content') }>
						<p>logo here</p>
						<span { ...styles('tagline') }>Find your artist. Own the ink.</span>
					</div>

					{ !!infoItems.length && (
						<div { ...styles('navigation') }>
							{ infoItems.map(({ category, routes }) => {
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
				</div>
			</div>

			<div { ...styles('legal') }>
				<div { ...wrapperStyles }>
					<div { ...styles('copyright') }>
						<span>© 2026 Inkquest, Inc.</span>
					</div>

					{ !!legalItems.length && (
						<div { ...styles('navigation') }>
							{ legalItems.map(({ category, routes }) => {
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
				</div>
			</div>
		</Box>
	)
}, classes)

Footer.displayName = NAME
Footer.setDefaults({ props: DEFAULT_PROPS })

export declare namespace Footer {
	export type Props = FooterProps
	export type Specs = FooterSpecs
}
