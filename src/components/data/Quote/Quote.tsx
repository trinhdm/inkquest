import { useProps, useStyles } from '@/hooks'
import { extractOtherProps } from '@/utils/helpers'
import { Box, polymorphic } from '@/components/core/Box'
import classes from './Quote.module.scss'

const NAME = 'Quote' as const,
	DEFAULT_TAG = 'div' as const

interface QuoteProps {
	author?: string
	quote: string
}

interface QuoteSpecs {
	default: { component: typeof DEFAULT_TAG }
	props: QuoteProps
}

export const Quote = polymorphic<QuoteSpecs>(_props => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props })

	const { author, children, quote, ...rest } = props
	const { as, others } = extractOtherProps(rest)

	return (
		<Box as={ as } { ...styles('root') } { ...others }>
			<span { ...styles('rail') } />
			<p { ...styles('content') }>
				"{ quote ?? children }"
			</p>
			<span { ...styles('caption', true) }>
				{ author }
			</span>
		</Box>
	)
}, classes)

Quote.displayName = NAME
Quote.setDefaults({ props: { as: DEFAULT_TAG } })

export declare namespace Quote {
	export type Props = QuoteProps
	export type Specs = QuoteSpecs
}
