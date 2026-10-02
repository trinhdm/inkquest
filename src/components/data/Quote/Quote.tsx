import { extractOthers } from '@/hooks/useProps'
import { polymorphic } from '@/lib/component'
import { Box } from '@/components/polymorphic/Box'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import classes from './Quote.module.scss'

const NAME = 'Quote' as const,
	TAG = 'div' as const

const DEFAULT_PROPS = {
	as: TAG,
} as const

interface QuoteProps {
	author?: string
	content: string
}

interface QuoteSpecs {
	defaults: {
		as: typeof TAG
		props: PropsDefaultList<typeof DEFAULT_PROPS>
	}
	props: QuoteProps
	selectors: QuoteSelectors
}

type QuoteSelectors =
	| 'root' | 'rail'
	| 'content' | 'caption'

export const Quote = polymorphic<QuoteSpecs>((_props, { useProps, useStyles }) => {
	const props = useProps(_props)
	const styles = useStyles({ props })

	const { as, author, content, ...rest } = props
	const others = extractOthers(rest)

	return (
		<Box
			{ ...styles('root', { global: { 'item--block': true } }) }
			{ ...others }
			as={ as }
		>
			<span { ...styles('rail', true) } />
			<p { ...styles('content', { global: { h4: true } }) }>
				"{ content }"
			</p>
			<span { ...styles('caption', true) }>
				{ author }
			</span>
		</Box>
	)
}, { name: NAME, classes })

Quote.setDefaults({ props: DEFAULT_PROPS })

export declare namespace Quote {
	export type Props = QuoteProps
	export type Specs = QuoteSpecs
}
