'use client'

import { Section } from '@/components/layout'

export default function FAQs() {
	return (
		<>
			<Section
				eyebrow="Company · FAQs"
				layout="hero"
				title="Questions, answered."
			>
				Everything about bidding, booking, verification, and payouts — for clients, artists, and studios. Can't find it? Message us.
			</Section>

			<Section
				eyebrow="Still need help?"
				id="faq-cta"
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
