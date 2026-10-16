import { useCallback, useMemo, type ReactNode } from 'react'
import { useTabGroupCtx } from './TabGroup/TabGroup.context'
import { extractOthers } from '@/hooks/useProps'
import { getTabIds } from './TabPanel/TabPanel.context'
import { polymorphic } from '@/lib/component/factory'
import { Box } from '@/components/polymorphic/Box'
import { TabGroup } from './TabGroup'
import { TabList, useTabListProps } from './TabList'
import { TabPanel } from './TabPanel'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import classes from './Tab.module.scss'

const NAME = 'Tab' as const,
	TAG = 'button' as const

const DEFAULT_PROPS = {
	as: TAG,
	index: 0,
} as const

const SUBCOMPONENTS = {
	Group: TabGroup,
	List: TabList,
	Panel: TabPanel,
} as const

interface TabProps {
	active?: boolean
	children: ReactNode
	disabled?: boolean
	index?: number
	onSelect?: (index: number) => void
}

interface TabSpecs {
	context: TabList.Context
	defaults: {
		as: typeof TAG
		props: PropsDefaultList<typeof DEFAULT_PROPS>
	}
	props: TabProps
	selectors: TabSelectors
	subcomponents: typeof SUBCOMPONENTS
	// tokens: TabTokens
}

type TabSelectors =
	| 'root' | 'label'

export const Tab = polymorphic<TabSpecs>((_props, { useProps, useStyles }) => {
	const { uid } = useTabGroupCtx(NAME)
	const props = useProps(useTabListProps(_props))
	const styles = useStyles({ props })

	const {
		active, as, children,
		disabled, id, index,
		onSelect, unstyled,
		...rest
	} = props

	const others = extractOthers(rest)

	const idx = useMemo(() => getTabIds(uid, index), [uid, index])


	const handleSelect = useCallback(() => {
		if (!disabled) onSelect?.(index)
	}, [disabled, index, onSelect])

	const aria = { controls: idx.panel, selected: !!active },
		data = { active: active || null, tab: true }

	return (
		<Box
			{ ...styles('root') }
			{ ...others }
			as={ as }
			attributes={ { aria, data } }
			onClick={ handleSelect }
			role="tab"
		>
			<span { ...styles('label') }>
				{ children }
			</span>
		</Box>
	)
}, { name: NAME, classes })

Tab.set({
	defaultProps: DEFAULT_PROPS,
	displayName: NAME,
	subcomponents: SUBCOMPONENTS,
})

export declare namespace Tab {
	export type Props = TabProps
	export type Specs = TabSpecs

	export namespace Group {
		export type Context = TabGroup.Context
		export type Props = TabGroup.Props
		export type Specs = TabGroup.Specs
	}

	export namespace List {
		export type Context = TabList.Context
		export type Props = TabList.Props
		export type Specs = TabList.Specs
	}

	export namespace Panel {
		export type Props = TabPanel.Props
		export type Specs = TabPanel.Specs
	}
}
