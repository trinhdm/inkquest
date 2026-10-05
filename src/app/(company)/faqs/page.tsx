'use client'

import { FaqsContent } from './FaqsContent'
import { FaqsBanner } from './FaqsBanner'
import { FaqsHero } from './FaqsHero'
import { FaqsProvider } from './faqs.context'
import './faqs.scss'

const FAQ_CATEGORY_PARAM = 'category'
const FAQ_QUERY_PARAM = 'q'
const FAQ_VALUES = {
	params: {
		category: FAQ_CATEGORY_PARAM,
		query: FAQ_QUERY_PARAM,
	},
	scroll: false,
}

export default function FAQs() {
	return (
		<FaqsProvider value={ FAQ_VALUES }>
			<FaqsHero />
			<FaqsContent />
			<FaqsBanner />
		</FaqsProvider>
	)
}
