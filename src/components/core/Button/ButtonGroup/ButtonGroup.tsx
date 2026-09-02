import {
	Children, Fragment, isValidElement,
	type ComponentType, type CSSProperties, type ReactNode,
} from 'react'
import { Box, polymorphic } from '@/components/core/Box'
import { ButtonGroupProvider } from './ButtonGroup.context'
import { useProps, useStyles } from '@/hooks'
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

const flattenChildren = (children: ReactNode): ReactNode[] => (
	Children.toArray(children).flatMap(child => {
		if (isValidElement<Button.Props>(child)) {
			if (child.type === Fragment) return flattenChildren(child.props.children)
			if ((child.type as ComponentType<Button.Props>).displayName !== 'Button') return null
		}

		return [child]
	})
)

export const ButtonGroup = polymorphic<ButtonGroupSpecs>(_props => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props })

	const {
		as,
		children,
		disabled,
		fullWidth,
		hasPriority,
		loading,
		orientation,
		unstyled,
		...rest
	} = props

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
			{ ...rest }
		>
			{ flattenChildren(children).map((child, index) => (
				<ButtonGroupProvider
					key={ isValidElement(child) && child.key !== null ? child.key : index }
					value={ {
						disabled, loading, unstyled,
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
