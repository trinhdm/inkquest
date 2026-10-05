'use client'

import { useFaqsCtx } from '../faqs.context'
import { Button } from '@/components/core/Button'
import { Section } from '@/components/layout/Section'

export const FaqsBanner = () => {
	const { pageID } = useFaqsCtx()

	return (
		<Section
			eyebrow="Still need help?"
			id={ `${pageID}-banner` }
			layout="banner"
			title="Ask a human."
		>
			Our support team answers within a day — usually much faster. For booking disputes or safety concerns, head straight to the Support page.

			<Section.Footer>
				<Button href="/careers">Open ticket</Button>
				<Button href="/press">Email support</Button>
			</Section.Footer>
		</Section>
	)
}

FaqsBanner.displayName = 'FaqsBanner'
