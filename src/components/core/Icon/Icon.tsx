import Link from 'next/link'
import { buildIcon } from './buildIcon'
import { isExternalLink, keyHasValue } from '@/utils/helpers'
import { polymorphic } from '@/lib/component/factory'
import { Box } from '@/components/polymorphic/Box'
import type { ComponentPropsWithoutRef } from 'react'
import type { Route } from 'next'
import type { LucideProps, LucideType } from './IconMap'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import type { SocialBrand } from '@/types/shared'
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

interface BaseIconProps<T extends LucideProps | SvgProps> {
	color?: T['color']
	href?: Route<string>
	hidden?: boolean
	strokeWidth?: T['strokeWidth']
}

interface LucideIconProps
	extends BaseIconProps<LucideProps> {
	filled?: boolean
	size?: LucideProps['size']
	strokeLinecap?: never
	type: LucideType
}

interface SocialIconProps
	extends BaseIconProps<SvgProps> {
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
	selectors: IconSelectors
}

type IconSelectors =
	| 'root' | 'glyph'

export const Icon = polymorphic<IconSpecs>((_props, { useProps, useStyles }) => {
	const props = useProps(_props)
	const styles = useStyles({ props })

	const iconEl = buildIcon({ props, styles, tag: TAG })
	if (!iconEl) return null

	if (keyHasValue(props, 'href')) {
		let linkProps = { ...styles('root'), href: props.href }

		if (isExternalLink(props.href)) {
			const external = { target: '_blank', rel: 'noopener noreferrer' }
			linkProps = { ...linkProps, ...external }
		}

		return <Box { ...linkProps } as={ Link }>{ iconEl }</Box>
	}

	return <Box { ...styles('root') } as="div">{ iconEl }</Box>
}, { name: NAME, classes })

Icon.set({
	defaultProps: DEFAULT_PROPS,
	displayName: NAME,
})

export declare namespace Icon {
	export type Props = IconProps
	export type Specs = IconSpecs

	export namespace Lucide {
		export type Props = LucideIconProps
	}

	export namespace Social {
		export type Props = SocialIconProps
	}

	export namespace Svg {
		export type Props = SvgProps
	}
}
