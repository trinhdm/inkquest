'use client'

import { Section } from '@/components/layout'

export default function Support() {
	const pageID = 'careers'

	return (
		<>
			<Section
				eyebrow="Support · Brooklyn + remote"
				id={ `${pageID}-hero` }
				layout="hero"
				title="Small crew, sharp needles."
			>
				We're a team of fourteen building the place where tattoo work gets found, priced, and booked on the artist's terms. Half of us are tattooed. All of us ship.
			</Section>
		</>
	)
}
