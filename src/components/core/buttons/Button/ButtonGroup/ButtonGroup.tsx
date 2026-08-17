import {
	Children, cloneElement, isValidElement,
	type CSSProperties, type ReactNode,
} from 'react'
import { Box, polymorphic, type BoxProps } from '@/components/core/Box'
// import { setThemeCSS } from '@/lib/theme'
import { useProps, useStyles, useVariantStyles } from '@/hooks'
import classes from '../Button.module.scss'
import type { Button } from '../Button'

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
	// cssVars: { root: ButtonGroupVars }
	default: { component: 'div' }
	props: ButtonGroupProps
}

// type ButtonVars = ColorVariable<typeof NAME>
const NAME = 'ButtonGroup' as const
const PRIORITY_ROLES: Button.Priority[] = ['primary', 'secondary', 'tertiary'] as const

const derivePriority = (index: number): Button.Priority => {
	const max = PRIORITY_ROLES.length,
		i = index < max ? index : max - 1
	return PRIORITY_ROLES[i]
}

// const cssVars = setThemeCSS<ButtonGroupSpecs>((theme, _props) => {
// 	return {
// 		root: {}
// 	}
// })

export const ButtonGroup = polymorphic<ButtonGroupSpecs>(_props => {
	useVariantStyles(NAME)
	const props = useProps(NAME, _props)
	const styles = useStyles<ButtonGroupSpecs>({
		name: NAME,
		classes,
		// cssVars,
		props,
	})

	const {
		as,
		children,
		disabled,
		fullWidth,
		hasPriority,
		orientation,
		...rest
	} = props

	return (
		<Box
			as={ as }
			data={ {
				direction: orientation === 'vertical' && 'vertical',
				block: !!fullWidth,
			} }
			role="group"
			{ ...styles('root') }
			{ ...rest }
		>
			{ Children.map(children, (child, index) => {
				if (!isValidElement<Button.Props>(child)) return null
				const propsCh = {}

				if (hasPriority && !Object.hasOwn(child.props, 'priority')) {
					const priority = derivePriority(index)
					Object.assign(propsCh, { priority })
				}

				if (disabled)
					Object.assign(propsCh, { disabled })

				return cloneElement(child, { ...child.props, ...propsCh })
			}) }
		</Box>
	)
}, classes)

ButtonGroup.displayName = NAME
ButtonGroup.setDefaults({
	props: {
		as: 'div',
		hasPriority: true,
		orientation: 'horizontal',
	}
})

export declare namespace ButtonGroup {
	export type Props = ButtonGroupProps
	export type Specs = ButtonGroupSpecs
}
