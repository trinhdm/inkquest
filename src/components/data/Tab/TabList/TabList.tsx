import {
	useLayoutEffect, useMemo, useRef,
	useState, type CSSProperties,
} from 'react'

import { useTabGroupCtx } from '../TabGroup/TabGroup.context'
import { extractOthers } from '@/hooks/useProps'
import { filterChildren } from '@/lib/component/children'
import { polymorphic } from '@/lib/component/factory'
import { rem } from '@/lib/general'
import { withProvider } from '@/lib/component/context'
import { Box } from '@/components/polymorphic/Box'
import { TabListProvider } from './TabList.context'
import type { CSSVars } from '@/types/shared'
import type { Tab } from '../Tab'
import type { TabListContext } from './TabList.context'
import classes from '../Tab.module.scss'

const NAME = 'Tab.List' as const

interface TabListProps {
	disabled?: Tab.Props['disabled']
}

type TabListSpecs = {
	isCompound: true
	props: TabListProps
	selectors: TabListSelectors
}

type TabListSelectors =
	| 'root' | 'inner' | 'rail'

interface TabListRail {
	position: string
	scale: number
}

export const TabList = polymorphic<TabListSpecs>((_props, { useProps, useStyles }) => {
	const context = useTabGroupCtx(NAME)
	const props = useProps(_props)
	const styles = useStyles({ props })

	const { active, onSelect } = context
	const { children, disabled, unstyled,...rest } = props
	const others = extractOthers(rest)

	const [rail, setRail] = useState<TabListRail | null>(null)
	const rootRef = useRef<HTMLDivElement>(null),
		listRef = useRef<HTMLDivElement>(null)

	const items = filterChildren(children, 'Tab', { name: NAME }),
		total = items.length

	useLayoutEffect(() => {
		const root = rootRef.current,
			list = listRef.current

		if (!root || !list) return

		//	the rail spans the whole list and is shrunk with `scaleX`, so moving it never triggers layout
		const measure = () => {
			const tab = list.children[active] as HTMLElement | undefined
			const next = tab && root.clientWidth ? {
				position: rem(list.offsetLeft + tab.offsetLeft),
				scale: tab.offsetWidth / root.clientWidth,
			} : null

			setRail(prev => (
				prev?.position === next?.position && prev?.scale === next?.scale ? prev : next
			))
		}

		measure()

		const observer = new ResizeObserver(measure)
		observer.observe(root)
		Array.from(list.children).forEach(tab => observer.observe(tab))

		return () => observer.disconnect()
	}, [active, total])

	const ctxValues = useMemo(
		() => Array.from({ length: total }, (_, index): TabListContext => ({
			active: active === index,
			disabled, index, onSelect, unstyled,
		})),
		[
			active, disabled,
			onSelect, total, unstyled,
		]
	)

	const railStyles = styles('rail')

	return (
		<Box
			{ ...styles('root') }
			{ ...others }
			as="div"
			attributes={ { data: { group: true } } }
			ref={ rootRef }
			role="tablist"
		>
			{ rail && (
				<span
					{ ...railStyles }
					style={ {
						...railStyles.style,
						'--tab-rail-position': rail.position,
						'--tab-rail-scale': rail.scale,
					} as CSSProperties & CSSVars }
				/>
			) }

			<div { ...styles('inner') } ref={ listRef }>
				{ withProvider(items, TabListProvider, ctxValues) }
			</div>
		</Box>
	)
}, { name: NAME, classes })

TabList.set({
	displayName: NAME,
})

export declare namespace TabList {
	export type Context = TabListContext
	export type Props = TabListProps
	export type Specs = TabListSpecs
}
