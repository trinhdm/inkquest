import { useButtonCxt } from '../Button.context'
import { useProps, useStyles} from '@/hooks'
import { extractOtherProps } from '@/utils/helpers'
import { Box, polymorphic } from '@/components/core/Box'
import classes from '../Button.module.scss'

const NAME = 'ButtonSection' as const,
	TAG = 'span' as const

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
	props: ButtonSectionProps
	specIs: { compound: true }
}

export const ButtonSection = polymorphic<ButtonSectionSpecs>(_props => {
	const ctx = useButtonCxt()
	const props = useProps(NAME, _props)
	const styles = useStyles(ctx?.displayName ?? NAME, { classes, props })

	const { children, left, right, ...rest } = props
	const { others } = extractOtherProps(rest)

	const data = { side: left ? 'left' : 'right' }

	return (
		<Box
			as={ TAG }
			attributes={ { data } }
			{ ...styles('section') }
			{ ...others }
		>
			{ children }
		</Box>
	)
}, classes)

ButtonSection.displayName = NAME
ButtonSection.setDefaults({ props: { left: true } })

export declare namespace ButtonSection {
	export type Props = ButtonSectionProps
	export type Specs = ButtonSectionSpecs
}
