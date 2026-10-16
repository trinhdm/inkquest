import { useCallback, useId, useMemo, useRef, type ReactNode, type RefObject } from 'react'
// import { defineTokens } from '@/lib/component/tokens'
import { extractOthers } from '@/hooks/useProps'
import { polymorphic } from '@/lib/component/factory'
import { toKebabCase } from '@/utils/helpers'
import { Box } from '@/components/polymorphic/Box'
import { TabList, useTabListProps } from './TabList'
import { TabPanel } from './TabPanel'
import { TabProvider, type TabContext } from './Tab.context'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import classes from './Tab.module.scss'

const NAME = 'Tab' as const,
	TAG = 'button' as const

const DEFAULT_PROPS = {
	as: TAG,
	index: 0,
} as const

const SUBCOMPONENTS = {
	List: TabList,
	Panel: TabPanel,
} as const

interface TabProps {
	active?: boolean
	children: ReactNode
	defaultActive?: boolean
	disabled?: boolean
	id?: string
	index?: number
	onToggle?: (ref: RefObject<HTMLButtonElement | null>, index: number, active: boolean) => void
	railWidth?: 0 | `${number}rem`
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

// type TabTokens = {
// 	root:
// 		| '--tab-rail-width'
// }

// const tokens = defineTokens<TabSpecs>()(({ props }) => {
// 	const { active, railWidth } = props

// 	return {
// 		root: {
// 			'--tab-rail-width': active && railWidth !== undefined
// 				? `translateX(${railWidth})`
// 				: undefined,
// 		},
// 	}
// })

export const Tab = polymorphic<TabSpecs>((_props, { useProps, useStyles }) => {
	const props = useProps(useTabListProps(_props))
	const styles = useStyles({ props })

	const {
		active, as, children,
		defaultActive, disabled, id,
		index, onToggle, railWidth, unstyled,
		...rest
	} = props

	const others = extractOthers(rest)

	const ref = useRef<HTMLButtonElement>(null)

	// const [uncontrolled, setUncontrolled] = useState(() => !!defaultActive)
	const isControlled = typeof active === 'boolean',
		isActive = isControlled ? !!active :  !!defaultActive

	const uid = useId()
	const idx = useMemo(() => {
		const root = toKebabCase(`tab-${id ?? uid}`)
		return { control: root, panel: `${root}-panel` }
	}, [id, uid])

	const handleTab = useCallback(() => {
		if (disabled) return
		const next = !isActive
		onToggle?.(ref, index, next)
	}, [
		disabled, isActive,
		index, onToggle,
	])

	const ctxValues = useMemo(() => ({
		disabled, idx, isActive,
		index, unstyled,
	}), [
		disabled, idx, index,
		isActive, unstyled,
	])

	const aria = { controls: idx.panel, selected: isActive },
		data = { active: isActive || null, tab: true }

	return (
		<Box
			{ ...styles('root') }
			{ ...others }
			as={ as }
			attributes={ { aria, data } }
			onClick={ handleTab }
			ref={ ref }
			role="tab"
		>
			<TabProvider value={ ctxValues }>
				<span { ...styles('label') }>
					{ children }
				</span>
			</TabProvider>
		</Box>
	)
}, { name: NAME, classes })

Tab.set({
	defaultProps: DEFAULT_PROPS,
	displayName: NAME,
	subcomponents: SUBCOMPONENTS,
})

export declare namespace Tab {
	export type Context = TabContext
	export type Props = TabProps
	export type Specs = TabSpecs

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
