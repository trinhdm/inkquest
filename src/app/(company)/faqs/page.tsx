'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Grid, Section, Sidebar } from '@/components/layout'
import { FaqCategory } from './FaqCategory'
import { FAQ_CATEGORIES, FAQ_PARAM, resolveFaqGroup } from './faqs.data'
import './faqs.scss'

export default function FAQs() {
	const pageID = 'faqs'
	const searchParams = useSearchParams()
	const activeGroup = resolveFaqGroup(searchParams.get(FAQ_PARAM))

	return (
		<>
			<Section
				eyebrow="Company · FAQs"
				id={ `${pageID}-hero` }
				layout="hero"
				title="Questions, answered."
			>
				Everything about bidding, booking, verification, and payouts — for clients, artists, and studios. Can't find it? Message us.
			</Section>

			<Section
				id={ `${pageID}-list` }
				// title="What we believe."
			>
				<Suspense>
					<Grid gap="lg">
						<Sidebar active={ activeGroup.id } items={ FAQ_CATEGORIES } />
						<FaqCategory { ...activeGroup } />
					</Grid>
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
