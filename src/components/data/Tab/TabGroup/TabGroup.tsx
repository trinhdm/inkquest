import {
	isValidElement, Children,
	useId, useMemo, useState,
	type ComponentType, type ReactNode,
} from 'react'

import { extractOthers } from '@/hooks/useProps'
import { getTabIds, TabPanelProvider } from '../TabPanel/TabPanel.context'
import { polymorphic } from '@/lib/component/factory'
import { toKebabCase } from '@/utils/helpers'
import { Box } from '@/components/polymorphic/Box'
import { TabGroupProvider, type TabGroupContext } from './TabGroup.context'
import { TabPanel } from '../TabPanel'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import classes from '../Tab.module.scss'

const NAME = 'Tab.Panel' as const
const DEFAULT_PROPS = {
	defaultActive: 0,
} as const

interface TabGroupProps {
	defaultActive?: number
	id?: string
}

interface TabGroupSpecs {
	defaults: { props: PropsDefaultList<typeof DEFAULT_PROPS> }
	isCompound: true
	props: TabGroupProps
	selectors: TabGroupSelectors
}

type TabGroupSelectors =
	| 'root'

const isPanel = (child: ReactNode) =>
	isValidElement(child) && (child.type as ComponentType).displayName === TabPanel.displayName

export const TabGroup = polymorphic<TabGroupSpecs>((_props, { useProps, useStyles }) => {
	const props = useProps(_props)
	const styles = useStyles({ props })

	const { children, defaultActive, id, unstyled, ...rest } = props
	const others = extractOthers(rest)

	const [active, setActive] = useState(() => defaultActive)

	const generated = useId()
	const uid = toKebabCase(`tab-${id ?? generated}`)

	const ctxValues = useMemo(() => ({
		active, onSelect: setActive,
		uid, unstyled,
	}), [active, uid, unstyled])

	let panelIndex = 0
	const content = Children.map(children, child => {
		if (!isPanel(child)) return child

		const index = panelIndex++,
			value = { idx: getTabIds(uid, index), isActive: active === index, unstyled }

		return <TabPanelProvider value={ value }>{ child }</TabPanelProvider>
	})

	return (
		<Box
			{ ...styles('root') }
			{ ...others }
			as="div"
		>
			<TabGroupProvider value={ ctxValues }>
				{ content }
			</TabGroupProvider>
		</Box>
	)
}, { name: NAME, classes })

TabGroup.set({
	defaultProps: DEFAULT_PROPS,
	displayName: NAME,
})

export declare namespace TabGroup {
	export type Context = TabGroupContext
	export type Props = TabGroupProps
	export type Specs = TabGroupSpecs
}
