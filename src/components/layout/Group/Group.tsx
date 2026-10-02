import {
	useMemo,
	useRef,
	Children,
	type CSSProperties,
	type ElementType,
	type ReactElement,
	type ReactNode,
} from 'react'

import {
	defineTokens,
	filterChildren,
	polymorphic,
	withProvider,
	type RootProviderFn,
} from '@/lib/component'

import { useReplayInView, type MaybeAnimationProps } from '@/hooks/animation'
import { extractOtherProps, type ReservedProp } from '@/hooks/useProps'
import { Box } from '@/components/polymorphic/Box'
import { GroupItem } from './GroupItem'
import { GroupProvider, type GroupContext } from './Group.context'
import type { Orientation } from '@/types/shared'
import type { PolymorphicProps, PropsDefaultList } from '@/lib/component/factory/types'
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

export const GROUP_CASCADE_PROPS = [
	'amount', 'initial', 'once', 'root',
	'animated', 'delay', 'duration', 'index', 'stagger',
	'lead', 'revealFrom', 'withinView',
] as const satisfies readonly ReservedProp[]

interface BaseGroupProps {
	children: ReactNode
	columns?: number
	divider?: boolean
	fullWidth?: boolean
	justify?: CSSProperties['justifyContent']
	orientation?: Orientation
}

interface CompoundGroupProps {
	childName?: never
	provider?: never
	valuesCtx?: never
}

interface NamedGroupProps<
	Ctx extends GroupContext = GroupContext,
	N extends string = string,
> {
	childName: string
	provider?: RootProviderFn<Ctx, N>
	valuesCtx?: Partial<Ctx>
}

type NestedGroupProps<
	Ctx extends GroupContext = GroupContext,
	N extends string = string,
> =
	| CompoundGroupProps
	| NamedGroupProps<Ctx, N>

type GroupProps<
	Ctx extends GroupContext = GroupContext,
	N extends string = string,
> =
	& BaseGroupProps
	& NestedGroupProps<Ctx, N>
	& MaybeAnimationProps

type GroupSpecs = {
	defaults: {
		as: typeof TAG
		props: PropsDefaultList<typeof DEFAULT_PROPS>
	}
	props: GroupProps<GroupContext, typeof NAME>
	selectors: GroupSelectors
	subcomponents: {
		Item: typeof GroupItem
	}
	tokens: GroupTokens
}

type GroupSelectors =
	| 'root'

type GroupTokens = {
	root:
		| '--group-item-count'
}

const tokens = defineTokens<GroupSpecs>(({ props }) => {
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

export const GroupBase = polymorphic<GroupSpecs>((_props, { useProps, useStyles }) => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { props, tokens })

	const {
		as,
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

	const others = extractOtherProps(rest)

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
		() => Array.from({ length: total }, (_, index) => ({
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

type GroupComponent =
	& (<
		Ctx extends GroupContext,
		U extends ElementType = typeof TAG,
		N extends string = typeof NAME,
	>(props: PolymorphicProps<GroupProps<Ctx, N>, U>) => ReactElement)
	& typeof GroupBase

export const Group = GroupBase as unknown as GroupComponent

Group.displayName = NAME
Group.Item = GroupItem
Group.setDefaults({ props: DEFAULT_PROPS })

export declare namespace Group {
	export type Context = GroupContext
	export type Props<
		Ctx extends GroupContext = GroupContext,
		N extends string = typeof NAME,
	> = GroupProps<Ctx, N>
	export type Specs = GroupSpecs

	export namespace Item {
		export type Props = GroupItem.Props
		export type Specs = GroupItem.Specs
	}
}
