'use client'

import { Section } from '@/components/layout/Section'

export default function Marketplace() {
	const pageID = 'marketplace'

	return (
		<>
			<Section
				id={ `${pageID}-hero` }
				layout="hero"
				title="Marketplace"
			>
				Marketplace
			</Section>
		</>
	)
}
