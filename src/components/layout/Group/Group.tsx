import {
	isValidElement, useMemo, useRef, Fragment,
	type CSSProperties, type ReactNode,
} from 'react'
import { useInView } from 'framer-motion'
import { useProps, useStyles } from '@/hooks'
import { extractOtherProps, flattenChildren } from '@/utils/helpers'
import { setThemeCSS } from '@/lib/theme'
import { Box, polymorphic } from '@/components/core/Box'
import { INVIEW_DEFAULTS } from '@/utils/constants'
import { renderWithProvider, type RootCxtProviderFn } from '@/lib/component'
import classes from './Group.module.scss'

const NAME = 'Group' as const,
	DEFAULT_TAG = 'div' as const

interface BaseGroupProps {
	childName: string
	children: ReactNode
	columns?: number
	divider?: boolean
	fullWidth?: boolean
	justify?: CSSProperties['justifyContent']
	orientation?: 'horizontal' | 'vertical'
	provider?: RootCxtProviderFn<GroupContext>
	revealed?: boolean
}

interface AnimatedGroupProps {
	animated: true
	duration: number
	stagger?: number
}

interface StaticGroupProps {
	animated?: never
	duration?: never
	stagger?: never
}

type GroupProps = BaseGroupProps & (
	| AnimatedGroupProps
	| StaticGroupProps
)

type GroupSpecs = {
	props: GroupProps
	specIs: { compound: true }
}

interface GroupContext {
	animated?: boolean
	duration?: number
	index?: number
	revealed?: boolean
	stagger?: number
	unstyled?: boolean
	withinView?: boolean
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
		animated,
		childName,
		children,
		columns,
		divider,
		duration,
		fullWidth,
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
	}

	const items = flattenChildren(children, childName),
		total = items.length

	// one observer for the whole group, so children stagger off a single t=0
	// rather than each racing its own IntersectionObserver
	const root = useRef<HTMLDivElement>(null)
	const withinView = useInView(root, { ...INVIEW_DEFAULTS, once: true })

	// one context value per child — memoised on `total` so identities stay
	// stable across renders even though each child gets its own object
	const cxtValues = useMemo(
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
			attributes={ {
				aria: { orientation },
				data: {
					block: !!fullWidth || null,
					orientation: orientation === 'vertical' ? 'vertical' : null,
				},
			} }
			role="group"
			ref={ root }
		>
			{ renderWithProvider(items, Provider, cxtValues) }
		</Box>
	)
}, classes)

Group.displayName = NAME
Group.setDefaults({})

export declare namespace Group {
	export type Context = GroupContext
	export type Props = GroupProps
	export type Specs = GroupSpecs
}
