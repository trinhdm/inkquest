import { useProps, extractOtherProps } from '@/hooks/useProps'
import { useStyles } from '@/hooks/useStyles'
import { polymorphic } from '@/lib/component'
import { Box } from '@/components/polymorphic/Box'
import type { ListProps } from '@/lib/component/factory/types'
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
		props: ListProps<typeof DEFAULT_PROPS>
	}
	props: QuoteProps
}

export const Quote = polymorphic<QuoteSpecs>(_props => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props })

	const { author, content, ...rest } = props
	const { as, others } = extractOtherProps(rest)

	return (
		<Box
			as={ as }
			{ ...styles('root', { global: { 'item--block': true } }) }
			{ ...others }
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
}, classes)

Quote.displayName = NAME
Quote.setDefaults({ props: DEFAULT_PROPS })

export declare namespace Quote {
	export type Props = QuoteProps
	export type Specs = QuoteSpecs
}
