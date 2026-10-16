'use client'

import { FaqsContent } from './content'
import { FaqsFooter } from './footer'
import { FaqsHero } from './hero'
import { FaqsProvider } from '../_utils/faqs.context'
import { FAQS_PAGE_DATA } from '../_utils/faqs.data'

const FAQ_CATEGORY_PARAM = 'category'
const FAQ_QUERY_PARAM = 'q'
const FAQ_VALUES = {
	data: FAQS_PAGE_DATA,
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
