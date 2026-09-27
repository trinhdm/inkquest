'use client'

import { useProps, extractOtherProps } from '@/hooks/useProps'
import { useStyles } from '@/hooks/useStyles'
import { listRoutesWithSlug } from '@/utils/navigation'
import { polymorphic } from '@/lib/component'
import { Box } from '@/components/polymorphic/Box'
import { FooterArea } from './FooterArea'
import { Icon } from '@/components/core'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import classes from './Footer.module.scss'

const NAME = 'Footer' as const,
	TAG = 'footer' as const

const BASE_FOOTER_NAV: FooterArea.Props['items'] = [
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
		orientation: 'horizontal',
	},
] as const

const DEFAULT_PROPS = {
	as: TAG,
	items: BASE_FOOTER_NAV,
} as const

interface FooterProps {
	items: FooterArea.Props['items']
}

interface FooterSpecs {
	defaults: {
		as: typeof TAG
		props: PropsDefaultList<typeof DEFAULT_PROPS>
	}
	props: FooterProps
	subcomponents: {
		Area: typeof FooterArea
	}
}

export const Footer = polymorphic<FooterSpecs>(_props => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props })

	const { children, items, ...rest } = props
	const { as, others } = extractOtherProps(rest)

	const infoItems = [],
		legalItems = []

	for (const item of items) {
		if (item.location === 'legal') legalItems.push(item)
		else infoItems.push(item)
	}

	return (
		<Box
			{ ...styles('root') }
			{ ...others }
			as={ as }
		>
			<div { ...styles('info') }>
				<FooterArea items={ infoItems }>
					<p>logo here</p>
					<span { ...styles('tagline') }>Find your artist. Own the ink.</span>
					<div { ...styles('socials') }>
						<Icon href="https://instagram.com" type="instagram" />
						<Icon type="tiktok" />
						<Icon type="x" />
					</div>
				</FooterArea>
			</div>

			<div { ...styles('legal') }>
				<FooterArea items={ legalItems }>
					<span>© 2026 Inkquest, Inc.</span>
				</FooterArea>
			</div>
		</Box>
	)
}, classes)

Footer.displayName = NAME
Footer.setDefaults({ props: DEFAULT_PROPS })
Footer.Area = FooterArea

export declare namespace Footer {
	export type Props = FooterProps
	export type Specs = FooterSpecs

	export namespace Area {
		export type Props = FooterArea.Props
		export type Specs = FooterArea.Specs
	}
}
