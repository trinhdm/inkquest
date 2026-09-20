import { useMemo, useRef, type CSSProperties, type ReactNode } from 'react'
import { useProps, useReplayInView, useStyles, extractOtherProps } from '@/hooks'
import { filterChildren, withProvider, type RootProviderFn } from '@/lib/component'
import { polymorphic, Box } from '@/components/polymorphic'
import { setThemeCSS } from '@/lib/theme'
import { GroupItem } from './GroupItem'
import { GroupProvider, type GroupContext } from './Group.context'
import type { UseInViewOptions } from 'framer-motion'
import classes from './Group.module.scss'

const NAME = 'Group' as const,
	DEFAULT_TAG = 'div' as const

interface BaseGroupProps
	extends Pick<UseInViewOptions, 'amount' | 'once'> {
	childName?: string
	children: ReactNode
	columns?: number
	divider?: boolean
	fullWidth?: boolean
	justify?: CSSProperties['justifyContent']
	orientation?: 'horizontal' | 'vertical'
	provider?: RootProviderFn<GroupContext>
}

interface AnimatedGroupProps {
	animated: true
	duration: number
	once?: boolean
	revealed?: boolean
	stagger?: number
}

interface StaticGroupProps {
	animated?: never
	duration?: never
	once?: never
	revealed?: never
	stagger?: never
}

type GroupProps = BaseGroupProps & (
	| AnimatedGroupProps
	| StaticGroupProps
)

type GroupSpecs = {
	defaults: { props: 'childName' | 'divider' | 'provider' }
	props: GroupProps
	subcomponents: {
		Item: typeof GroupItem
	}
}

const tokens = setThemeCSS<GroupSpecs>((theme, _props) => {
	return {
		root: {
			'--group-cols': _props.columns,
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
		revealed,
		stagger,
		unstyled,
		...rest
	} = props

	const { others } = extractOtherProps(rest)

	const module = {
		divider,
		grid: !orientation,
		[`${orientation}`]: !!orientation,
	}

	const aria = { orientation }
	const data = {
		block: !!fullWidth || null,
		divide: !!divider || null,
	}

	const items = filterChildren(children, childName),
		total = items.length

	// one observer for the whole group, so children stagger off a single t=0
	// rather than each racing its own IntersectionObserver
	const root = useRef<HTMLDivElement>(null)
	const withinView = useReplayInView(root, { amount, once })

	// one context value per child — memoised on `total` so identities stay
	// stable across renders even though each child gets its own object
	const ctxValues = useMemo<GroupContext[]>(
		() => Array.from({ length: total }, (_, index) => ({
			animated, duration, index, revealed, stagger, unstyled, withinView,
		})),
		[animated, duration, revealed, stagger, total, unstyled, withinView]
	)

	return (
		<Box
			{ ...styles('root', { module }) }
			{ ...others }
			as={ DEFAULT_TAG }
			attributes={ { aria, data } }
			ref={ root }
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
