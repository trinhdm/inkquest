'use client'

import { Section } from '@/components/layout/Section'

export default function DiscoverArtists() {
	const pageID = 'discover-artists'

	return (
		<>
			<Section
				id={ `${pageID}-hero` }
				layout="hero"
				title="Discover Artists"
			>
				discover artists
			</Section>
		</>
	)
}
