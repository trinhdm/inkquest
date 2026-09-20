import { useMemo, type CSSProperties, type ReactNode } from 'react'
import { useProps, useStyles, extractOtherProps, revealItemFrom } from '@/hooks'
import { filterChildren, withProvider } from '@/lib/component'
import { polymorphic, Box, type ListProps } from '@/components/polymorphic'
import { ButtonGroupProvider, type ButtonGroupContext } from './ButtonGroup.context'
import type { Button } from '../Button'
import classes from '../Button.module.scss'

const NAME = 'Button.Group' as const
const DEFAULT_PROPS = {
	hasPriority: true,
	orientation: 'horizontal',
} as const

const PRIORITY_ROLES: Button.Priority[] = [
	'primary',
	'secondary',
	'tertiary',
] as const

interface ButtonGroupProps
	extends Pick<Button.Props, 'disabled' | 'loading' | 'size'> {
	children?: ReactNode
	fullWidth?: boolean
	hasPriority?: boolean
	justify?: CSSProperties['justifyContent']
	orientation?: 'horizontal' | 'vertical'
	revealFrom?: number
}

type ButtonGroupSpecs = {
	defaults: { props: ListProps<typeof DEFAULT_PROPS> }
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
		[`${orientation}`]: !!orientation || null,
		[`${size}`]: size,
	}

	const items = filterChildren(children, 'Button'),
		total = items.length

	const ctxValues = useMemo(
		() => Array.from({ length: total }, (_, index): ButtonGroupContext => ({
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
			{ withProvider(items, ButtonGroupProvider, ctxValues) }
		</Box>
	)
}, classes)

ButtonGroup.displayName = NAME
ButtonGroup.setDefaults({ props: DEFAULT_PROPS })

export declare namespace ButtonGroup {
	export type Context = ButtonGroupContext
	export type Props = ButtonGroupProps
	export type Specs = ButtonGroupSpecs
}
