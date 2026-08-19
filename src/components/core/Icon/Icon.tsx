import { useProps, useStyles, useVariantStyles } from '@/hooks'
import { Box, polymorphic, type BoxProps } from '@/components/core/Box'
import { ICON_MAP, type IconType } from './IconMap'
import type { LucideProps } from 'lucide-react'
import classes from './Icon.module.scss'

const NAME = 'Icon' as const,
	TAG = 'svg' as const

interface IconProps extends LucideProps, BoxProps {
	type: IconType
}

interface IconSpecs {
	default: { component: typeof TAG }
	props: IconProps
}

export const Icon = polymorphic<IconSpecs>(_props => {
	useVariantStyles(NAME)
	const props = useProps(NAME, _props)
	const styles = useStyles<IconSpecs>(NAME, { classes, props })

	const {
		as,
		type,
		...rest
	} = props

	const component = ICON_MAP[type]
	if (!component) return null

	return (
		<Box
			as={ component }
			{ ...styles('root') }
			{ ...rest }
		/>
	)
}, classes)

Icon.displayName = NAME
Icon.setDefaults({
	props: {
		as: TAG,
		size: 24,
	}
})

export declare namespace Icon {
	export type Props = IconProps
	export type Specs = IconSpecs
}
