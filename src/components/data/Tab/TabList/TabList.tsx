import { useCallback, useMemo, useState, type RefObject } from 'react'
import { extractOthers } from '@/hooks/useProps'
import { filterChildren } from '@/lib/component/children'
import { polymorphic } from '@/lib/component/factory'
import { rem } from '@/lib/general'
import { withProvider } from '@/lib/component/context'
import { Box } from '@/components/polymorphic/Box'
import { TabListProvider } from './TabList.context'
import type { Tab } from '../Tab'
import type { TabListContext } from './TabList.context'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import classes from '../Tab.module.scss'

const NAME = 'Tab.List' as const
const DEFAULT_PROPS = {
	defaultActive: 0,
} as const

interface TabListProps {
	defaultActive?: number
	disabled?: Tab.Props['disabled']
}

type TabListSpecs = {
	defaults: { props: PropsDefaultList<typeof DEFAULT_PROPS> }
	isCompound: true
	props: TabListProps
	selectors: TabListSelectors
}

type TabListSelectors =
	| 'root' | 'inner' | 'rail'

export const TabList = polymorphic<TabListSpecs>((_props, { useProps, useStyles }) => {
	const props = useProps(_props)
	const styles = useStyles({ props })

	const {
		children, defaultActive,
		disabled, unstyled,
		...rest
	} = props

	const others = extractOthers(rest)

	const [activeTab, setActiveTab] = useState<number>(() => defaultActive)
	const [railWidth, setRailWidth] = useState<0 | `${number}rem`>(0)

	const handleRailWidth = (ref: RefObject<HTMLButtonElement | null>) => {
		const item = ref.current

		if (!!item) {
			const width = item.offsetWidth
			setRailWidth(rem(width, .125))
			console.log({ width, rem: rem(width), round: rem(width, .125) })
		}
	}

	const handleToggle = useCallback((
		ref: RefObject<HTMLButtonElement | null>,
		index: number,
		next: boolean,
	) => {
		handleRailWidth(ref)
		setActiveTab(prev => (next ? index : prev))
	}, [])

	const items = filterChildren(children, 'Tab', { name: NAME }),
		total = items.length

	const ctxValues = useMemo(
		() => Array.from({ length: total }, (_, index): TabListContext => ({
			disabled, index, unstyled,
			active: activeTab === index,
			railWidth,
			onToggle: handleToggle,
		})),
		[
			handleToggle,
			activeTab, disabled,
			railWidth, total, unstyled,
		]
	)

	return (
		<Box
			{ ...styles('root') }
			{ ...others }
			as="div"
			attributes={ { data: { group: true } } }
			role="tablist"
		>
			<div { ...styles('inner') }>
				{ withProvider(items, TabListProvider, ctxValues) }
				<span { ...styles('rail') } />
			</div>
		</Box>
	)
}, { name: NAME, classes })

TabList.set({
	defaultProps: DEFAULT_PROPS,
	displayName: NAME,
})

export declare namespace TabList {
	export type Context = TabListContext
	export type Props = TabListProps
	export type Specs = TabListSpecs
}
