import Image, { type ImageProps } from 'next/image'
import Link from 'next/link'
import { useColorScheme } from '@/hooks/useColorScheme'
import { extractOthers } from '@/hooks/useProps'
import { isExternalLink, keyHasValue } from '@/utils/helpers'
import { polymorphic } from '@/lib/component/factory'
import { Box } from '@/components/polymorphic/Box'
import { COMPANY_NAME } from '@/utils/constants'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import type { Route } from 'next'
import classes from './Logo.module.scss'

const NAME = 'Logo' as const,
	TAG = 'div' as const

const DEFAULT_PROPS = {
	alt: `${COMPANY_NAME} Logo`,
	as: TAG,
	href: '/',
	loading: 'eager',
	type: 'wordmark',
	width: 124,
} as const

const LOGOS_CONFIG = [
	{
		type: 'mark',
		viewBox: 40,
	},
	{
		type: 'wordmark',
		viewBox: {
			height: 42,
			width: 240,
		},
	},
] as const satisfies LogoConfig[]

interface LogoProps
	extends Omit<ImageProps, 'alt' | 'height' | 'fill' | 'src'> {
	alt?: string
	href?: Route | null
	type?: 'mark' | 'wordmark'
}

interface LogoConfig {
	type: LogoProps['type']
	viewBox: number | {
		height: number
		width: number
	}
}

interface LogoSpecs {
	defaults: {
		as: typeof TAG
		props: PropsDefaultList<typeof DEFAULT_PROPS>
	}
	props: LogoProps
	selectors: LogoSelectors
}

type LogoSelectors =
	| 'root' | 'image'

export const Logo = polymorphic<LogoSpecs>((_props, { useProps, useStyles }) => {
	const { colorScheme } = useColorScheme()
	const props = useProps(_props)
	const styles = useStyles({ props })

	const {
		alt, as, loading,
		type, unstyled,
		width: pxWidth,
		...rest
	} = props

	const others = extractOthers(rest)

	const sharedProps = {
		...styles('root'),
		attributes: { data: { scheme: colorScheme } },
		unstyled,
	}

	const { viewBox } = LOGOS_CONFIG.find(logo => type === logo.type)!

	const vb = typeof viewBox === 'object' ? viewBox : { height: viewBox, width: viewBox },
		width = typeof pxWidth === 'number' ? pxWidth : Number(pxWidth),
		height = Math.round(width * vb.height / vb.width)

	const filename = type === 'wordmark' ? `${type}-${colorScheme}` : type

	const logoEl = (
		<Image
			{ ...styles('image') }
			{ ...others }
			src={ `/logo/${filename}.svg` }
			alt={ alt }
			height={ height }
			loading={ loading }
			width={ width }
		/>
	)

	if (keyHasValue(props, 'href') && !!props.href) {
		const { href } = props
		let linkProps = { ...sharedProps, href }

		if (isExternalLink(href)) {
			const external = { target: '_blank', rel: 'noopener noreferrer' }
			linkProps = { ...linkProps, ...external }
		}

		return <Box { ...linkProps } as={ Link }>{ logoEl }</Box>
	}

	return <Box { ...sharedProps } as={ as }>{ logoEl }</Box>
}, { name: NAME, classes })

Logo.set({
	defaultProps: DEFAULT_PROPS,
	displayName: NAME,
})

export declare namespace Logo {
	export type Props = LogoProps
	export type Specs = LogoSpecs
}
