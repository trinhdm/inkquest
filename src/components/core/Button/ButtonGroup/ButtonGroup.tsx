import { useMemo, type CSSProperties, type ReactNode } from 'react'
import { useProps, useStyles } from '@/hooks'
import { extractOtherProps, filterChildren } from '@/utils/helpers'
import { renderWithProvider } from '@/lib/component'
import { Box, polymorphic } from '@/components/core/Box'
import { ButtonGroupProvider, type ButtonGroupContext } from './ButtonGroup.context'
import type { Button } from '../Button'
import classes from '../Button.module.scss'

const NAME = 'ButtonGroup' as const
const PRIORITY_ROLES: Button.Priority[] = ['primary', 'secondary', 'tertiary'] as const

interface ButtonGroupProps {
	children?: ReactNode
	fullWidth?: boolean
	justify?: CSSProperties['justifyContent']
	orientation?: 'horizontal' | 'vertical'

	disabled?: boolean
	hasPriority?: boolean
	loading?: boolean
	size?: Button.Props['size']
}

type ButtonGroupSpecs = {
	isCompound: true
	props: ButtonGroupProps
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

	const module = {
		[`${orientation}`]: orientation,
		[`${size}`]: size,
	}

	const items = filterChildren(children, 'Button'),
		total = items.length

	const cxtValues = useMemo<ButtonGroup.Context[]>(
		() => Array.from({ length: total }, (_, index) => ({
			disabled, loading, size, unstyled,
			priority: hasPriority ? derivePriority(index) : undefined,
		})),
		[disabled, hasPriority, loading, size, total, unstyled]
	)

	return (
		<Box
			{ ...styles('root', { module }) }
			{ ...others }
			as="div"
			attributes={ {
				aria: { orientation },
				data: { block: !!fullWidth || null },
			} }
			role="group"
		>
			{ renderWithProvider(items, ButtonGroupProvider, cxtValues) }
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
	export type Context = ButtonGroupContext
	export type Props = ButtonGroupProps
	export type Specs = ButtonGroupSpecs
}
