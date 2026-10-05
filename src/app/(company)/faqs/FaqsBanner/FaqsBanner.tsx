'use client'

import { useFaqsCtx } from '../faqs.context'
import { Section } from '@/components/layout/Section'

export const FaqsBanner = () => {
	const { pageID } = useFaqsCtx()

	return (
		<Section
			eyebrow="Still need help?"
			id={ `${pageID}-banner` }
			layout="cta"
			title="Ask a human."
		>
			Our support team answers within a day — usually much faster. For booking disputes or safety concerns, head straight to the Support page.

			<Section.Button href="/careers">Open ticket</Section.Button>
			<Section.Button href="/press">Email support</Section.Button>
		</Section>
	)
}

FaqsBanner.displayName = 'FaqsBanner'
