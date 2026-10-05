'use client'

import { Section } from '@/components/layout/Section'

export default function DiscoverStyles() {
	const pageID = 'discover-styles'

	return (
		<>
			<Section
				id={ `${pageID}-hero` }
				layout="hero"
				title="Discover Styles"
			>
				discover styles
			</Section>
		</>
	)
}
