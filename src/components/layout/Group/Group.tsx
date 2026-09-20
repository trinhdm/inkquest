import {
	useMemo,
	useRef,
	Children,
	type CSSProperties,
	type ReactNode,
} from 'react'

import {
	useProps,
	useReplayInView,
	useStyles,
	extractOtherProps,
	type MaybeAnimationProps,
} from '@/hooks'

import { filterChildren, withProvider, type RootProviderFn } from '@/lib/component'
import { polymorphic, Box, type ListProps } from '@/components/polymorphic'
import { setThemeCSS } from '@/lib/theme'
import { GroupItem } from './GroupItem'
import { GroupProvider, type GroupContext } from './Group.context'
import classes from './Group.module.scss'

const NAME = 'Group' as const,
	TAG = 'div' as const

const DEFAULT_PROPS = {
	as: TAG,
	childName: GroupItem.displayName,
	divider: false,
	provider: GroupProvider,
	valuesCtx: {},
} as const

interface BaseGroupProps {
	children: ReactNode
	columns?: number
	divider?: boolean
	fullWidth?: boolean
	justify?: CSSProperties['justifyContent']
	orientation?: 'horizontal' | 'vertical'
}

interface CompoundGroupProps {
	childName?: never
	provider?: never
	valuesCtx?: never
}

interface NamedGroupProps {
	childName: string
	provider?: RootProviderFn<GroupContext>
	valuesCtx?: object
}

type NestedGroupProps =
	| CompoundGroupProps
	| NamedGroupProps

type GroupProps =
	& BaseGroupProps
	& NestedGroupProps
	& MaybeAnimationProps

type GroupSpecs = {
	defaults: {
		as: typeof TAG
		props: ListProps<typeof DEFAULT_PROPS>
	}
	props: GroupProps
	subcomponents: {
		Item: typeof GroupItem
	}
}

const tokens = setThemeCSS<GroupSpecs>((theme, props) => {
	const { columns, children, orientation } = props
	const hasColumns = !!(columns && columns > 0)
	let numCols: number | undefined = hasColumns ? columns : undefined

	if (!!orientation && !hasColumns) {
		const count = Children.count(children)
		numCols = count > 1 ? count - 1 : count
	}

	return {
		root: {
			'--group-item-count': numCols,
		},
	}
})

export const Group = polymorphic<GroupSpecs>(_props => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props, tokens })

	const {
		amount,
		animated,
		childName,
		children,
		columns,
		divider,
		duration,
		fullWidth,
		once,
		orientation,
		provider: Provider,
		stagger,
		unstyled,
		valuesCtx,
		...rest
	} = props

	const { as, others } = extractOtherProps(rest)

	const aria = { orientation }
	const data = {
		block: !!fullWidth || null,
		divide: !!divider || null,
	}

	const items = filterChildren(children, childName),
		total = items.length

	// one observer for the whole group, so children stagger off a single t=0
	// rather than each racing its own IntersectionObserver
	const ref = useRef<HTMLDivElement>(null)
	const withinView = useReplayInView(ref, { amount, once })

	// one context value per child — memoised on `total` so identities stay
	// stable across renders even though each child gets its own object
	const ctxValues = useMemo(
		() => Array.from({ length: total }, (_, index): GroupContext => ({
			animated, duration, index, stagger, unstyled, withinView,
			...valuesCtx,
		})),
		[animated, duration, stagger, total, unstyled, valuesCtx, withinView]
	)

	return (
		<Box
			{ ...styles('root') }
			{ ...others }
			as={ as }
			attributes={ { aria, data } }
			ref={ ref }
			role="group"
		>
			{ withProvider(items, Provider, ctxValues) }
		</Box>
	)
}, classes)

Group.displayName = NAME
Group.Item = GroupItem
Group.setDefaults({ props: DEFAULT_PROPS })

export declare namespace Group {
	export type Context = GroupContext
	export type Props = GroupProps
	export type Specs = GroupSpecs

	export namespace Item {
		export type Props = GroupItem.Props
		export type Specs = GroupItem.Specs
	}
}
