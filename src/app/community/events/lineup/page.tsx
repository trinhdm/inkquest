'use client'

import { Section } from '@/components/layout/Section'

export default function YourLineup() {
	const pageID = 'your-lineup'

	return (
		<>
			<Section
				id={ `${pageID}-hero` }
				layout="hero"
				title="Your Lineup"
			>
				your lineup
			</Section>
		</>
	)
}
