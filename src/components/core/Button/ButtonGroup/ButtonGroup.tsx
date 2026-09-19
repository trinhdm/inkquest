import { useMemo, type CSSProperties, type ReactNode } from 'react'
import { useProps, useStyles, extractOtherProps, revealItemFrom } from '@/hooks'
import { filterChildren } from '@/utils/helpers'
import { polymorphic, Box } from '@/components/polymorphic'
import { renderWithProvider } from '@/lib/component'
import { ButtonGroupProvider, type ButtonGroupContext } from './ButtonGroup.context'
import type { Button } from '../Button'
import classes from '../Button.module.scss'

const NAME = 'Button.Group' as const
const PRIORITY_ROLES: Button.Priority[] = ['primary', 'secondary', 'tertiary'] as const

interface ButtonGroupProps {
	children?: ReactNode
	fullWidth?: boolean
	justify?: CSSProperties['justifyContent']
	orientation?: 'horizontal' | 'vertical'
	revealFrom?: number

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
		revealFrom,
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

	const ctxValues = useMemo<ButtonGroup.Context[]>(
		() => Array.from({ length: total }, (_, index) => ({
			disabled, loading, size, unstyled,
			priority: hasPriority ? derivePriority(index) : undefined,
			...revealItemFrom(index, revealFrom),
		})),
		[disabled, hasPriority, loading, revealFrom, size, total, unstyled]
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
			{ renderWithProvider(items, ButtonGroupProvider, ctxValues) }
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
