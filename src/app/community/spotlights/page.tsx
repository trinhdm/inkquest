'use client'

import Link from 'next/link'
import { Button } from '@/components/core/Button'
import { Grid } from '@/components/layout/Grid'
import { Section } from '@/components/layout/Section'

export default function CommunitySpotlights() {
	const pageID = 'community-spotlights'

	return (
		<>
			<Section
				eyebrow="THE SCENE, WEEKLY"
				id={ `${pageID}-hero` }
				layout="hero-split"
				title="Spotlights"
			>
				Interviews, studio visits, and craft talk from the artists you follow. New issue every Thursday.

				<Section.Footer>
					<Button href="/community/spotlights" variant="outline">
						Pitch a story
					</Button>
				</Section.Footer>
			</Section>
			<Section id={ `${pageID}-filters` }>
				<div>Style</div>
				<div>Tabs</div>
			</Section>
			<Section id={ `${pageID}-issues` } title="Past issues">
				One a week — pick any issue to read it here.

				<div>filter bar</div>
				<Grid>
					<Link href="/community/spotlights">spotlight card</Link>
				</Grid>
			</Section>
		</>
	)
}
