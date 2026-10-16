import { useTabCtx } from '../Tab.context'
import { extractOthers } from '@/hooks/useProps'
import { polymorphic } from '@/lib/component/factory'
import { withInlineWrap } from '@/lib/component/children'
import { Box } from '@/components/polymorphic/Box'
import type { ReactNode } from 'react'
import type { Tab } from '../Tab'
import classes from '../Tab.module.scss'

const NAME = 'Tab.Panel' as const

interface TabPanelProps {
	children: ReactNode
}

interface TabPanelSpecs {
	context: Tab.Context
	isCompound: true
	props: TabPanelProps
	selectors: TabPanelSelectors
}

type TabPanelSelectors =
	| 'root' | 'wrapper' | 'inner'

export const TabPanel = polymorphic<TabPanelSpecs>((_props, { useProps, useStyles }) => {
	const context = useTabCtx(NAME)
	const props = useProps(_props)
	const styles = useStyles({ context, props })

	const { idx, isActive } = useTabCtx(NAME)
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
			id={ idx.panel }
			inert={ !isActive || undefined }
			role="tabpanel"
		>
			{ withInlineWrap(children) }
		</Box>
	)
}, { name: NAME, classes })

TabPanel.set({ displayName: NAME })

export declare namespace TabPanel {
	export type Props = TabPanelProps
	export type Specs = TabPanelSpecs
}
