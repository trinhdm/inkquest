import {
	useMemo, useRef,
	type ElementType, type ReactElement, type ReactNode,
} from 'react'

import { useReplayInView, type MaybeAnimationProps } from '@/hooks/animation'
import { countChildren, filterChildren } from '@/lib/component/children'
import { defineTokens } from '@/lib/component/tokens'
import { extractOthers, type ReservedProp } from '@/hooks/useProps'
import { keyHasValue } from '@/utils/helpers'
import { polymorphic } from '@/lib/component/factory'
import { withProvider } from '@/lib/component/context'
import { Box } from '@/components/polymorphic/Box'
import { GroupItem } from './GroupItem'
import { GroupProvider, type GroupContext } from './Group.context'
import type { JustifyContent, Orientation } from '@/types/shared'
import type { PolymorphicProps, PropsDefaultList } from '@/lib/component/factory/types'
import type { RootProviderFn } from '@/lib/component/context'
import classes from './Group.module.scss'

const NAME = 'Group' as const,
	TAG = 'div' as const

const DEFAULT_PROPS = {
	as: TAG,
	childName: GroupItem.displayName,
	divider: false,
	provider: GroupProvider,
	values: {},
} as const

const SUBCOMPONENTS = {
	Item: GroupItem,
} as const

export const GROUP_CASCADE_PROPS = [
	'amount', 'initial', 'once', 'root',
	'animated', 'delay', 'duration', 'index', 'stagger',
	'lead', 'revealFrom', 'withinView',
] as const satisfies readonly ReservedProp[]

const GROUP_TAGS: readonly ElementType[] = ['fieldset', 'hgroup', 'optgroup']

interface BaseGroupProps {
	children: ReactNode
	columns?: number
	divider?: boolean
	header?: ReactNode
	fullWidth?: boolean
	justify?: JustifyContent
	orientation?: Orientation
}

interface CompoundGroupProps {
	childName?: never
	provider?: never
	values?: never
}

interface NamedGroupProps<Ctx extends GroupContext = GroupContext> {
	childName: string
	provider?: RootProviderFn<Ctx>
	values?: Partial<Ctx>
}

type NestedGroupProps<Ctx extends GroupContext = GroupContext> =
	| CompoundGroupProps
	| NamedGroupProps<Ctx>

type GroupProps<Ctx extends GroupContext = GroupContext> =
	& BaseGroupProps
	& NestedGroupProps<Ctx>
	& MaybeAnimationProps

type GroupSpecs = {
	defaults: {
		as: typeof TAG
		props: PropsDefaultList<typeof DEFAULT_PROPS>
	}
	props: GroupProps<GroupContext>
	selectors: GroupSelectors
	subcomponents: typeof SUBCOMPONENTS
	tokens: GroupTokens
}

type GroupSelectors =
	| 'root'

type GroupTokens = {
	root:
		| '--group-item-count'
		| '--group-justify'
}

const tokens = defineTokens<GroupSpecs>()(({ props }) => {
	const {
		childName, children,
		columns, justify, orientation,
	} = props

	const hasColumns = !!(columns && columns > 0)
	let numCols

	if (hasColumns) {
		numCols = columns
	} else if (!!orientation) {
		const count = countChildren(children, childName)
		numCols = count > 1 ? count - 1 : count
	}

	return {
		root: {
			'--group-item-count': numCols,
			'--group-justify': justify ?? undefined,
		},
	}
})

export const GroupBase = polymorphic<GroupSpecs>((_props, { useProps, useStyles }) => {
	const props = useProps(_props)
	const styles = useStyles({ props, tokens })

	const {
		as, amount, animated,
		childName, children, columns,
		divider, duration, fullWidth,
		header, justify, once,
		orientation, provider: Provider,
		stagger, values,
		...rest
	} = props

	const others = extractOthers(rest)

	// one observer for the whole group, so children stagger off a single t=0
	// rather than each racing its own IntersectionObserver
	const ref = useRef<HTMLDivElement>(null)
	const withinView = useReplayInView(ref, { amount, once })

	const items = filterChildren(children, childName, { name: NAME }),
		total = items.length

	const isUnstyled = useMemo(
		() => (keyHasValue(values, { unstyled: true }) ? values.unstyled : props.unstyled),
		[props.unstyled, values]
	)

	// one context value per child — memoised on `total` so identities stay
	// stable across renders even though each child gets its own object
	const ctxValues = useMemo(
		() => Array.from({ length: total }, (_, index) => ({
			animated, duration, index, stagger, withinView,
			...values,
			unstyled: isUnstyled,
		})),
		[
			animated, duration, stagger, total,
			isUnstyled, values, withinView,
		]
	)

	return (
		<Box
			{ ...styles('root') }
			{ ...others }
			as={ as }
			attributes={ {
				aria: { orientation },
				data: {
					block: !!fullWidth || null,
					divide: !!divider || null,
				}
			} }
			ref={ ref }
			role={ !!as && GROUP_TAGS.includes(as) ? undefined : 'group' }
		>
			{ header }
			{ withProvider(items, Provider, ctxValues) }
		</Box>
	)
}, { name: NAME, classes })

type GroupComponent =
	& (<
		Ctx extends GroupContext,
		U extends ElementType = typeof TAG
	>(props: PolymorphicProps<GroupProps<Ctx>, U>) => ReactElement)
	& typeof GroupBase

export const Group = GroupBase as unknown as GroupComponent

Group.set({
	defaultProps: DEFAULT_PROPS,
	displayName: NAME,
	subcomponents: SUBCOMPONENTS,
})

export declare namespace Group {
	export type Context = GroupContext
	export type Props<Ctx extends GroupContext = GroupContext> = GroupProps<Ctx>
	export type Specs = GroupSpecs

	export type CompoundProps = Omit<Group.Props, 'childName' | 'header' | 'provider' | 'values'>

	export namespace Item {
		export type Props = GroupItem.Props
		export type Specs = GroupItem.Specs
	}
}
