import { useProps, extractOtherProps } from '@/hooks/useProps'
import { useStyles } from '@/hooks/useStyles'
import { isExternalLink, keyHasValue } from '@/utils/helpers'
import { polymorphic } from '@/lib/component'
import { Box } from '@/components/polymorphic/Box'
import { ICON_MAP, type LucideType } from './IconMap'
import type { ComponentPropsWithoutRef } from 'react'
import type { LucideProps } from 'lucide-react'
import type { Route } from 'next'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import type { SocialBrand } from '@/types/shared'
import Link from 'next/link'
import classes from './Icon.module.scss'

const NAME = 'Icon' as const,
	TAG = 'svg' as const

const DEFAULT_PROPS = {
	as: TAG,
	color: 'currentColor',
	size: 16,
	strokeLinecap: 'round',
} as const

type SvgProps =
	ComponentPropsWithoutRef<'svg'>

interface BaseIconProps<T extends SvgProps | LucideProps> {
	color?: T['color']
	href?: string
	strokeWidth?: T['strokeWidth']
}

interface LucideIconProps extends BaseIconProps<LucideProps> {
	filled?: boolean
	size?: LucideProps['size']
	strokeLinecap?: never
	type: LucideType
}

interface SocialIconProps extends BaseIconProps<SvgProps> {
	filled?: never
	size?: SvgProps['width']
	strokeLinecap?: SvgProps['strokeLinecap']
	type: SocialBrand
}

type IconProps =
	| LucideIconProps
	| SocialIconProps

interface IconSpecs {
	defaults: {
		as: typeof TAG
		props: PropsDefaultList<typeof DEFAULT_PROPS>
	}
	props: IconProps
}

const isSocialIcon = (type: IconProps['type']): type is SocialBrand =>
	!keyHasValue(ICON_MAP, type)


const getBrandProps = (type: IconProps['type']): SvgProps | undefined => {
	switch (type) {
		case 'instagram':
			return {
				children: (
					<g>
						<rect x="2" y="2" width="20" height="20" rx="5" />
						<circle cx="12" cy="12" r="4" />
						<path d="M17.5 6.5h.01" />
					</g>
				),
				strokeWidth: '2.222',
				viewBox: '-1.33 -1.33 26.66 26.66',
			}
		case 'tiktok':
			return {
				children: <path d="M9 12a4 4 0 1 0 4 4V4c.4 2.8 2.2 5 5 5" />,
				strokeWidth: '1.777',
				viewBox: '0.833 1.333 21.333 21.333',
			}
		case 'x':
			return {
				children: <path d="M3.2 3.2h5.3l5.1 6.9 5.9-6.9h2.3l-7 8.2 7.6 10.4h-5.3l-5.3-7.2-6.2 7.2H3l7.4-8.6z" />,
				fill: 'currentColor',
				stroke: 'none',
				viewBox: '1.06 0.86 23.28 23.28',
			}
		default:
			return
	}
}

const configSocialIcon = ({ color, strokeWidth, type }: IconProps): SvgProps | undefined => {
	const brandProps = getBrandProps(type)

	if (!brandProps) return
	if (strokeWidth) brandProps.strokeWidth = strokeWidth

	const baseProps = {
		fill: 'none',
		stroke: color,
	}

	return { ...baseProps, ...brandProps }
}

const buildIcon = (
	props: IconProps,
	styles: ReturnType<typeof useStyles>,
) => {
	const { color, filled, href, size, type, ...rest } = props
	const { others } = extractOtherProps(rest)

	const sharedProps = {
		...others,
		...styles('glyph'),
		attributes: { aria: { label: type } }
	}

	if (isSocialIcon(type)) {
		const brandProps = configSocialIcon(props)
		if (!brandProps) return null

		return (
			<Box
				{ ...sharedProps }
				{ ...brandProps }
				as="svg"
				height={ size }
				role="img"
				width={ size }
			>
				<title>{ type }</title>
				{ brandProps.children }
			</Box>
		)
	} else {
		const target = ICON_MAP[type]
		if (!target) return null

		return (
			<Box
				{ ...sharedProps }
				as={ target }
				color={ color }
				fill={ filled ? 'currentColor' : undefined }
				size={ size }
			/>
		)
	}
}

export const Icon = polymorphic<IconSpecs>(_props => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props })

	const iconEl = buildIcon(props, styles)
	if (!iconEl) return null

	if ('href' in props) {
		let linkProps = { ...styles('root'), href: props.href as Route<string> }

		if (isExternalLink(props.href)) {
			const external = { target: '_blank', rel: 'noopener noreferrer' }
			linkProps = { ...linkProps, ...external }
		}

		return <Box { ...linkProps } as={ Link }>{ iconEl }</Box>
	}

	return <Box { ...styles('root') } as="div">{ iconEl }</Box>
}, classes)

Icon.displayName = NAME
Icon.setDefaults({ props: DEFAULT_PROPS })

export declare namespace Icon {
	export type Props = IconProps
	export type Specs = IconSpecs
}
