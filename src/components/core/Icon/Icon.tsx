import { useProps, useStyles } from '@/hooks'
import { Box, polymorphic } from '@/components/core/Box'
import { ICON_MAP, type IconType } from './IconMap'
import type { LucideProps } from 'lucide-react'
import classes from './Icon.module.scss'

const NAME = 'Icon' as const,
	TAG = 'svg' as const

interface IconProps {
	color?: LucideProps['color']
	filled?: boolean
	size?: LucideProps['size']
	strokeWidth?: LucideProps['strokeWidth']
	type: IconType
}

interface IconSpecs {
	defaults: {
		component: typeof TAG
		props: 'size'
	}
	props: IconProps
}

export const Icon = polymorphic<IconSpecs>(_props => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props })

	const { as, filled, type, ...rest } = props

	const component = ICON_MAP[type]
	if (!component) return null

	return (
		<Box
			as={ component }
			fill={ filled ? 'currentColor' : undefined }
			{ ...styles('root') }
			{ ...rest }
		/>
	)
}, classes)

Icon.displayName = NAME
Icon.setDefaults({
	props: {
		as: TAG,
		size: 16,
	}
})

export declare namespace Icon {
	export type Props = IconProps
	export type Specs = IconSpecs
}
