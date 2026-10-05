'use client'

import Link from 'next/link'
import { Suspense } from 'react'
import { FaqBrowser } from './FaqBrowser'
import { FaqCategory } from './FaqCategory'
import { FaqSearch } from './FaqSearch'
import { FaqsProvider } from './faqs.context'
import { Field } from '@/components/form/Field'
import { Section } from '@/components/layout/Section'
import { resolveFaqGroup } from './faqs.data'
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
	const pageID = 'faqs',
		initGroup = resolveFaqGroup()

	return (
		<FaqsProvider value={ FAQ_VALUES }>
			<Section
				eyebrow="Company · FAQs"
				id={ `${pageID}-hero` }
				layout="hero"
				title="Questions, answered."
			>
				<>Everything about bidding, booking, verification, and payouts — for clients, artists, and studios. Can&apos;t find it? <Link href="/messages" data-cta>Message us</Link>.</>

				<Suspense fallback={ (
					<Field disabled id={ `${pageID}-search` } size="lg">
						<Field.Input placeholder="Search all FAQs…" type="search" />
					</Field>
				) }>
					<FaqSearch />
				</Suspense>
			</Section>

			<Section id={ `${pageID}-list` }>
				<Suspense fallback={ <FaqCategory group={ initGroup } /> }>
					<FaqBrowser />
				</Suspense>
			</Section>

			<Section
				eyebrow="Still need help?"
				id={ `${pageID}-cta` }
				layout="cta"
				title="Ask a human."
			>
				Our support team answers within a day — usually much faster. For booking disputes or safety concerns, head straight to the Support page.

				<Section.Button href="/careers">Open ticket</Section.Button>
				<Section.Button href="/press">Email support</Section.Button>
			</Section>
		</FaqsProvider>
	)
}
