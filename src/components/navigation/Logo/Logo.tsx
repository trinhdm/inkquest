import { useColorScheme } from '@/hooks/useColorScheme'
import { useProps, extractOtherProps } from '@/hooks/useProps'
import { polymorphic } from '@/lib/component'
import { Box } from '@/components/polymorphic/Box'
import { COMPANY_NAME } from '@/utils/constants'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import type { Route } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import classes from './Logo.module.scss'

const NAME = 'Logo' as const

const DEFAULT_PROPS = {
	alt: `${COMPANY_NAME} Logo`,
	href: '/',
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
] as const

interface LogoProps {
	alt?: string
	href?: string
	type?: 'mark' | 'wordmark'
	width?: number
}

interface LogoConfig {
	type: 'mark' | 'wordmark'
	viewBox: number | {
		height: number
		width: number
	}
}

interface LogoSpecs {
	defaults: { props: PropsDefaultList<typeof DEFAULT_PROPS> }
	props: LogoProps
	selectors: LogoSelectors
}

type LogoSelectors =
	| 'root' | 'image'

export const Logo = polymorphic<LogoSpecs>((_props, { useStyles }) => {
	const { colorScheme } = useColorScheme()
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { props })

	const {
		alt,
		href,
		type,
		width,
		...rest
	} = props

	const others = extractOtherProps(rest)

	const { viewBox } = LOGOS_CONFIG.find(logo => type === logo.type)!
	const vb = typeof viewBox === 'number'
		? { height: viewBox, width: viewBox }
		: viewBox

	const height = Math.round(width * vb.height / vb.width),
		filename = type === 'wordmark' ? `${type}-${colorScheme}` : type

	return (
		<Box
			{ ...styles('root') }
			{ ...others }
			as={ Link }
			href={ href as Route<typeof href> }
		>
			<Image
				{ ...styles('image') }
				src={ `/logo/${filename}.svg` }
				alt={ alt }
				height={ height }
				width={ width }
			/>
		</Box>
	)
}, classes)

Logo.displayName = NAME
Logo.setDefaults({ props: DEFAULT_PROPS })

export declare namespace Logo {
	export type Props = LogoProps
	export type Specs = LogoSpecs
}
