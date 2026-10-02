'use client'

import { useProps, extractOtherProps } from '@/hooks/useProps'
import { useStyles } from '@/hooks/useStyles'
import { polymorphic } from '@/lib/component'
import { Box } from '@/components/polymorphic/Box'
import { FooterArea } from './FooterArea'
import { Icon } from '@/components/core/Icon'
import { Logo } from '../Logo'
import { COMPANY_NAME } from '@/utils/constants'
import { FOOTER_GLOBAL_NAV, SOCIALS_NAV } from '@/utils/navigation'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import type { SocialBrand } from '@/types/shared'
import classes from './Footer.module.scss'

const NAME = 'Footer' as const,
	TAG = 'footer' as const

const DEFAULT_PROPS = {
	as: TAG,
	items: FOOTER_GLOBAL_NAV,
	socials: ['instagram', 'tiktok', 'x'],
} as const

interface FooterProps {
	items?: FooterArea.Props['items']
	socials?: readonly SocialBrand[]
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

	const { as, children, items, socials, ...rest } = props
	const others = extractOtherProps(rest)

	const currentYear = new Date().getFullYear()
	const socialIcons = !!socials?.length
		? SOCIALS_NAV.filter(social => socials.includes(social.type))
		: SOCIALS_NAV

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
					<Logo width={ 148 } />
					<span { ...styles('tagline') }>
						Find your artist. Own the ink.
					</span>
					<div { ...styles('socials') }>
						{ socialIcons.map(({ type, url }) => (
							<Icon key={ `${type}-footer` } href={ url } type={ type } />
						)) }
					</div>
				</FooterArea>
			</div>

			<div { ...styles('legal') }>
				<FooterArea items={ legalItems }>
					<span>© { currentYear } { COMPANY_NAME }</span>
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
