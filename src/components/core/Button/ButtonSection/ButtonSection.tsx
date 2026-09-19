import { useButtonCtx } from '../Button.context'
import { useProps, useStyles, extractOtherProps } from '@/hooks'
import { Box, polymorphic } from '@/components/core/Box'
import classes from '../Button.module.scss'

const NAME = 'Button.Section' as const

interface LeftSectionProps {
	left: true
	right?: never
}
interface RightSectionProps {
	left?: never
	right: true
}

type ButtonSectionProps = (
	| LeftSectionProps
	| RightSectionProps
)

type ButtonSectionSpecs = {
	isCompound: true
	props: ButtonSectionProps
}

export const ButtonSection = polymorphic<ButtonSectionSpecs>(_props => {
	const { rootName } = useButtonCtx(NAME)
	const props = useProps(NAME, _props)
	const styles = useStyles(rootName, { classes, props })

	const { children, left, right, ...rest } = props
	const { others } = extractOtherProps(rest)

	const data = { side: left ? 'left' : 'right' }

	return (
		<Box
			{ ...styles('section') }
			{ ...others }
			as="span"
			attributes={ { data } }
		>
			{ children }
		</Box>
	)
}, classes)

ButtonSection.displayName = NAME
ButtonSection.setDefaults({})

export declare namespace ButtonSection {
	export type Props = ButtonSectionProps
	export type Specs = ButtonSectionSpecs
}
