'use client'

import { FaqsContent } from './content'
import { FaqsFooter } from './footer'
import { FaqsHero } from './hero'
import { FaqsProvider } from '../_utils/faqs.context'

const FAQ_CATEGORY_PARAM = 'category'
const FAQ_QUERY_PARAM = 'q'
const FAQ_VALUES = {
	params: {
		category: FAQ_CATEGORY_PARAM,
		query: FAQ_QUERY_PARAM,
	},
	scroll: false,
}

export const FaqsBase = () => {
	return (
		<FaqsProvider value={ FAQ_VALUES }>
			<FaqsHero />
			<FaqsContent />
			<FaqsFooter />
		</FaqsProvider>
	)
}

FaqsBase.displayName = 'FaqsBase'
