import { useTabPanelCtx, useTabPanelProps, type TabPanelContext } from './TabPanel.context'
import { extractOthers } from '@/hooks/useProps'
import { polymorphic } from '@/lib/component/factory'
import { withInlineWrap } from '@/lib/component/children'
import { Box } from '@/components/polymorphic/Box'
import type { ReactNode } from 'react'
import classes from '../Tab.module.scss'

const NAME = 'Tab.Panel' as const

interface TabPanelProps {
	children: ReactNode
}

interface TabPanelSpecs {
	context: TabPanelContext
	isCompound: true
	props: TabPanelProps
	selectors: TabPanelSelectors
}

type TabPanelSelectors =
	| 'root' | 'wrapper' | 'inner'

export const TabPanel = polymorphic<TabPanelSpecs>((_props, { useProps, useStyles }) => {
	const context = useTabPanelCtx(NAME)
	const props = useProps(useTabPanelProps(_props, 'unstyled'))
	const styles = useStyles({ context, props })

	const { idx, isActive } = context
	const { children, ...rest } = props
	const others = extractOthers(rest)

	return (
		<Box
			{ ...styles('root') }
			{ ...others }
			as="div"
			attributes={ { aria: {
				hidden: !isActive,
				labelledby: idx.control,
			} } }
			hidden={ !isActive }
			id={ idx.panel }
			role="tabpanel"
		>
			{ withInlineWrap(children) }
		</Box>
	)
}, { name: NAME, classes })

TabPanel.set({ displayName: NAME })

export declare namespace TabPanel {
	export type Context = TabPanelContext
	export type Props = TabPanelProps
	export type Specs = TabPanelSpecs
}
