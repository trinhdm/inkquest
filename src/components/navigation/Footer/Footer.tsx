'use client'

import { useProps, useStyles } from '@/hooks'
import { extractOtherProps } from '@/utils/helpers'
import { Box, polymorphic } from '@/components/core/Box'
import classes from './Footer.module.scss'

const NAME = 'Footer' as const,
	DEFAULT_TAG = 'footer' as const

interface FooterProps {}

interface FooterSpecs {
	defaults: { as: typeof DEFAULT_TAG }
	props: FooterProps
}

export const Footer = polymorphic<FooterSpecs>(_props => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props })

	const { children, ...rest } = props
	const { as, others } = extractOtherProps(rest)
	const wrapperStyles = styles('wrapper', true)

	return (
		<Box as={ as } { ...styles('root') } { ...others }>
			<div { ...styles('main') }>
				<div { ...wrapperStyles }>
					<div { ...styles('col') }>
						<p>logo here</p>
						<span { ...styles('tagline') }>Find your artist. Own the ink.</span>
					</div>
					<div { ...styles('col') }>
						navitems
					</div>
				</div>
			</div>
			<div { ...styles('copyright') }>
				<div { ...wrapperStyles }>
					<div { ...styles('col') }>
						<span>© 2026 Inkquest, Inc.</span>
					</div>
					<div { ...styles('col') }>
						<span>navitems</span>
					</div>
				</div>
			</div>
		</Box>
	)
}, classes)

Footer.displayName = NAME
Footer.setDefaults({ props: { as: DEFAULT_TAG } })

export declare namespace Footer {
	export type Props = FooterProps
	export type Specs = FooterSpecs
}
