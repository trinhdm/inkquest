import { isValidElement, type CSSProperties, type ReactNode } from 'react'
import { useProps, useStyles } from '@/hooks'
import { extractOtherProps, flattenChildren } from '@/utils/helpers'
import { Box, polymorphic } from '@/components/core/Box'
import { ButtonGroupProvider } from './ButtonGroup.context'
import type { Button } from '../Button'
import classes from '../Button.module.scss'

const PRIORITY_ROLES: Button.Priority[] = ['primary', 'secondary', 'tertiary'] as const
const NAME = 'ButtonGroup' as const,
	DEFAULT_TAG = 'div' as const

export interface ButtonGroupProps {
	children?: ReactNode
	fullWidth?: boolean
	justify?: CSSProperties['justifyContent']
	orientation?: 'horizontal' | 'vertical'

	disabled?: boolean
	hasPriority?: boolean
	loading?: boolean
	size?: Button.Props['size']
}

export type ButtonGroupSpecs = {
	props: ButtonGroupProps
	specIs: { compound: true }
}

const derivePriority = (index: number): Button.Priority => {
	const max = PRIORITY_ROLES.length,
		i = index < max ? index : max - 1
	return PRIORITY_ROLES[i]
}

export const ButtonGroup = polymorphic<ButtonGroupSpecs>(_props => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props })

	const {
		children,
		disabled,
		fullWidth,
		hasPriority,
		loading,
		orientation,
		size,
		unstyled,
		...rest
	} = props

	const { others } = extractOtherProps(rest)

	return (
		<Box
			as={ DEFAULT_TAG }
			attributes={ {
				aria: { orientation },
				data: {
					block: !!fullWidth || null,
					orientation: (orientation === 'vertical' && 'vertical') || null,
				},
			} }
			role="group"
			{ ...styles('root') }
			{ ...others }
		>
			{ flattenChildren(children, 'Button').map((child, index) => (
				<ButtonGroupProvider
					key={ isValidElement(child) && child.key !== null ? child.key : index }
					value={ {
						disabled, loading, size, unstyled,
						priority: hasPriority ? derivePriority(index) : undefined,
					} }
				>
					{ child }
				</ButtonGroupProvider>
			)) }
		</Box>
	)
}, classes)

ButtonGroup.displayName = NAME
ButtonGroup.setDefaults({
	props: {
		hasPriority: true,
		orientation: 'horizontal',
	}
})

export declare namespace ButtonGroup {
	export type Props = ButtonGroupProps
	export type Specs = ButtonGroupSpecs
}
