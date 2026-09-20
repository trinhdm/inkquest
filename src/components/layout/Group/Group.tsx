import {
	useMemo,
	useRef,
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
import { polymorphic, Box } from '@/components/polymorphic'
import { setThemeCSS } from '@/lib/theme'
import { GroupItem } from './GroupItem'
import { GroupProvider, type GroupContext } from './Group.context'
import classes from './Group.module.scss'

const NAME = 'Group' as const,
	DEFAULT_TAG = 'div' as const

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
}

interface NamedGroupProps {
	childName: string
	provider?: RootProviderFn<GroupContext>
}

type NestedGroupProps =
	| CompoundGroupProps
	| NamedGroupProps

type GroupProps =
	& BaseGroupProps
	& NestedGroupProps
	& MaybeAnimationProps

type GroupSpecs = {
	defaults: { props: 'childName' | 'divider' | 'provider' }
	props: GroupProps
	subcomponents: {
		Item: typeof GroupItem
	}
}

const tokens = setThemeCSS<GroupSpecs>((theme, props) => {
	const { columns } = props

	return {
		root: {
			'--group-cols': !!(columns && columns > 0) ? columns : undefined,
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
		...rest
	} = props

	const { others } = extractOtherProps(rest)

	const module = { [`${orientation}`]: !!orientation || null },
		aria = { orientation },
		data = {
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
		})),
		[animated, duration, stagger, total, unstyled, withinView]
	)

	return (
		<Box
			{ ...styles('root', { module }) }
			{ ...others }
			as={ DEFAULT_TAG }
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
Group.setDefaults({
	props: {
		childName: GroupItem.displayName,
		divider: true,
		provider: GroupProvider,
	}
})

export declare namespace Group {
	export type Context = GroupContext
	export type Props = GroupProps
	export type Specs = GroupSpecs

	export namespace Item {
		export type Props = GroupItem.Props
		export type Specs = GroupItem.Specs
	}
}
