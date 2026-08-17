import { Box, polymorphic, type BoxProps } from '@/components/core/Box'
import { useProps, useStyles, useVariantStyles } from '@/hooks'
import classes from '../Button.module.scss'

interface LeftButtonSectionProps {
	left: true
	right?: never
}
interface RightButtonSectionProps {
	left?: never
	right: true
}

export type ButtonSectionProps = BoxProps & (
	| LeftButtonSectionProps
	| RightButtonSectionProps
)

export type ButtonSectionSpecs = {
	default: { component: 'span' }
	props: ButtonSectionProps
}

const NAME = 'ButtonSection' as const,
	TAG = 'span' as const

export const ButtonSection = polymorphic<ButtonSectionSpecs>(_props => {
	useVariantStyles(NAME)
	const props = useProps(NAME, _props)
	const styles = useStyles<ButtonSectionSpecs>({
		name: NAME,
		classes,
		props,
	})

	const { as, children, left, ...rest } = props

	return (
		<Box
			as="span"
			data={ { side: left ? 'left' : 'right' } }
			{ ...styles('section') }
			{ ...rest }
		>
			{ children }
		</Box>
	)
}, classes)

ButtonSection.displayName = NAME
ButtonSection.setDefaults({
	props: {
		as: 'span',
		left: true,
	}
})

export declare namespace ButtonSection {
	export type Props = ButtonSectionProps
	export type Specs = ButtonSectionSpecs
}
