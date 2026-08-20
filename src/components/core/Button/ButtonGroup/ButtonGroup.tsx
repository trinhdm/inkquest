import {
	Children, cloneElement, Fragment, isValidElement,
	type ComponentType, type CSSProperties, type ReactNode,
} from 'react'
import { Box, polymorphic, type BoxProps } from '@/components/core/Box'
import { useProps, useStyles, useVariantStyles } from '@/hooks'
import type { Button } from '../Button'
import classes from '../Button.module.scss'

const PRIORITY_ROLES: Button.Priority[] = ['primary', 'secondary', 'tertiary'] as const
const NAME = 'ButtonGroup' as const,
	TAG = 'div' as const

export interface ButtonGroupProps extends BoxProps {
	children?: ReactNode
	fullWidth?: boolean
	justify?: CSSProperties['justifyContent']
	orientation?: 'horizontal' | 'vertical'

	disabled?: boolean
	hasPriority?: boolean
	loading?: boolean
}

export type ButtonGroupSpecs = {
	default: { component: typeof TAG }
	props: ButtonGroupProps
	specIs: { compound: true }
}

type Props = ButtonGroupProps

const childrenWithProps = (
	parentProps: Props
): ReturnType<typeof cloneElement<Button.Props>>[] => {
	const { children, disabled, hasPriority, loading } = parentProps

	return Children.map(children, (child, index) => {
		if (!isValidElement<Button.Props>(child)) return null

		const childType = child.type as ComponentType<Button.Props>,
			propsCh = {}

		if (childType === Fragment)
			return childrenWithProps({ ...parentProps, children: child.props.children })
		else if (childType.displayName !== 'Button')
			return null

		if (hasPriority && !Object.hasOwn(child.props, 'priority')) {
			const priority = derivePriority(index)
			Object.assign(propsCh, { priority })
		}

		if (typeof disabled === 'boolean')
			Object.assign(propsCh, { disabled })

		if (typeof loading === 'boolean')
			Object.assign(propsCh, { loading })

		return cloneElement(child, { ...child.props, ...propsCh })
	}) as ReturnType<typeof cloneElement<Button.Props>>[]
}

const derivePriority = (index: number): Button.Priority => {
	const max = PRIORITY_ROLES.length,
		i = index < max ? index : max - 1
	return PRIORITY_ROLES[i]
}

export const ButtonGroup = polymorphic<ButtonGroupSpecs>(_props => {
	useVariantStyles(NAME)
	const props = useProps(NAME, _props)
	const styles = useStyles<ButtonGroupSpecs>(NAME, { classes, props })

	const {
		as,
		children,
		disabled,
		fullWidth,
		hasPriority,
		loading,
		orientation,
		...rest
	} = props

	const direction = (orientation === 'vertical' && 'vertical') || undefined

	return (
		<Box
			as={ as }
			attributes={ {
				aria: { orientation: direction },
				data: {
					orientation: direction,
					block: !!fullWidth || null,
				},
			} }
			role="group"
			{ ...styles('root') }
			{ ...rest }
		>
			{ childrenWithProps(props) }
		</Box>
	)
}, classes)

ButtonGroup.displayName = NAME
ButtonGroup.setDefaults({
	props: {
		as: TAG,
		hasPriority: true,
		orientation: 'horizontal',
	}
})

export declare namespace ButtonGroup {
	export type Props = ButtonGroupProps
	export type Specs = ButtonGroupSpecs
}
