import { Children, cloneElement, isValidElement, type ReactNode } from 'react'
import { useProps, useStyles, useVariantStyles } from '@/hooks'
import { Box, polymorphic, type BoxProps } from '@/components/core/Box'
import { Icon } from '@/components/core/Icon'
import classes from '../Button.module.scss'

const NAME = 'ButtonSection' as const,
	TAG = 'span' as const

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
) & {
	as?: never
	parentName?: string
}

export type ButtonSectionSpecs = {
	default: { component: typeof TAG }
	props: ButtonSectionProps
	specIs: { compound: true }
}

const ICON_SIZE = 18

const enforceIconSize = (children: ReactNode): ReactNode =>
	Children.map(children, child => {
		if (isValidElement<Icon.Props>(child) && child.type === Icon)
			return cloneElement(child, { size: ICON_SIZE })
		return child
	})

export const ButtonSection = polymorphic<ButtonSectionSpecs>(_props => {
	useVariantStyles(NAME)
	const props = useProps(NAME, _props)
	const { as, children, left, right, parentName, ...rest } = props
	const styles = useStyles<ButtonSectionSpecs>(parentName ?? NAME, { classes, props })

	return (
		<Box
			as={ TAG }
			attributes={ {
				data: { side: left ? 'left' : 'right' },
			} }
			{ ...styles('section') }
			{ ...rest }
		>
			{ enforceIconSize(children) }
		</Box>
	)
}, classes)

ButtonSection.displayName = NAME
ButtonSection.setDefaults({ props: { left: true } })

export declare namespace ButtonSection {
	export type Props = ButtonSectionProps
	export type Specs = ButtonSectionSpecs
}
