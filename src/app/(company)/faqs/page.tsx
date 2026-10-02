'use client'

import Link from 'next/link'
import { Suspense } from 'react'
import { resolveFaqGroup } from './faqs.data'
import { FaqBrowser } from './FaqBrowser'
import { FaqCategory } from './FaqCategory'
import { Section } from '@/components/layout/Section'
import { TextInput } from '@/components/form/TextInput'
import './faqs.scss'

export default function FAQs() {
	const pageID = 'faqs'

	return (
		<>
			<Section
				eyebrow="Company · FAQs"
				id={ `${pageID}-hero` }
				layout="hero"
				title="Questions, answered."
			>
				<>Everything about bidding, booking, verification, and payouts — for clients, artists, and studios. Can't find it? <Link href="/messages" data-cta>Message us</Link>.</>

				<TextInput placeholder="Search questions" />
			</Section>

			<Section id={ `${pageID}-list` }>
				<Suspense fallback={ <FaqCategory { ...resolveFaqGroup() } /> }>
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
		</>
	)
}
