'use client'

import { Section } from '@/components/layout/Section'

export default function Collections() {
	const pageID = 'collections'

	return (
		<>
			<Section
				id={ `${pageID}-hero` }
				layout="hero"
				title="Collections"
			>
				collections
			</Section>
		</>
	)
}
