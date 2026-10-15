import { useMemo, type ReactNode } from 'react'
import { defineTokens } from '@/lib/component/tokens'
import { extractOthers } from '@/hooks/useProps'
import { filterChildren } from '@/lib/component/children'
import { polymorphic } from '@/lib/component/factory'
import { revealItemFrom } from '@/hooks/animation'
import { withProvider } from '@/lib/component/context'
import { Box } from '@/components/polymorphic/Box'
import { ButtonGroupProvider, type ButtonGroupContext } from './ButtonGroup.context'
import type { Button } from '../Button'
import type { JustifyContent, Orientation } from '@/types/shared'
import type { PropsDefaultList } from '@/lib/component/factory/types'
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
	justify?: JustifyContent
	orientation?: Orientation
	revealFrom?: number
}

type ButtonGroupSpecs = {
	defaults: { props: PropsDefaultList<typeof DEFAULT_PROPS> }
	isCompound: true
	props: ButtonGroupProps
	selectors: ButtonGroupSelectors
	tokens: ButtonGroupTokens
}

type ButtonGroupSelectors =
	| 'root'

type ButtonGroupTokens = {
	root:
		| '--button-group-gap'
		| '--button-group-justify'
}

const derivePriority = (index: number): Button.Priority => {
	const max = PRIORITY_ROLES.length,
		i = index < max ? index : max - 1
	return PRIORITY_ROLES[i]
}

const tokens = defineTokens<ButtonGroupSpecs>()(({ props, theme }) => {
	const { justify, size } = props
	let buttonGroupGap

	if (size) {
		const groupGap: Record<Button.Size, string> = {
			sm: theme.space('group'),
			md: theme.space('group'),
			lg: theme.space('group', 'lg'),
		}

		buttonGroupGap = groupGap[size]
	}

	return {
		root: {
			'--button-group-gap': buttonGroupGap,
			'--button-group-justify': justify ?? undefined,
		},
	}
})

export const ButtonGroup = polymorphic<ButtonGroupSpecs>((_props, { useProps, useStyles }) => {
	const props = useProps(_props)
	const styles = useStyles({ props, tokens })

	const {
		children, disabled, fullWidth,
		hasPriority, justify, loading,
		orientation, revealFrom, size,
		unstyled,
		...rest
	} = props

	const others = extractOthers(rest)

	const clsx = {
		module: { [`${orientation}`]: !!orientation || null },
	}

	const items = filterChildren(children, 'Button', { name: NAME }),
		total = items.length

	const ctxValues = useMemo(
		() => Array.from({ length: total }, (_, index): ButtonGroupContext => ({
			disabled, loading, size, unstyled,
			priority: hasPriority ? derivePriority(index) : undefined,
			...revealItemFrom(index, revealFrom),
		})),
		[
			disabled, hasPriority, loading,
			revealFrom, size, total, unstyled,
		]
	)

	return (
		<Box
			{ ...styles('root', clsx) }
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
}, { name: NAME, classes })

ButtonGroup.set({
	defaultProps: DEFAULT_PROPS,
	displayName: NAME,
})

export declare namespace ButtonGroup {
	export type Context = ButtonGroupContext
	export type Props = ButtonGroupProps
	export type Specs = ButtonGroupSpecs
}
