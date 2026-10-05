'use client'

import Link from 'next/link'
import { Button } from '@/components/core/Button'
import { Grid } from '@/components/layout/Grid'
import { Section } from '@/components/layout/Section'
import { Sidebar } from '@/components/layout/Sidebar'

export default function CommunityEvents() {
	const pageID = 'community-events'

	return (
		<>
			<Section
				id={ `${pageID}-hero` }
				layout="hero-split"
				title="Upcoming Events"
			>
				<>
					4 EVENTS · 3 GUEST SPOTS · 1 DROPS
				</>

				<Section.Footer>
					<Button href="/community/events" variant="outline">
						Post an event
					</Button>
				</Section.Footer>
			</Section>
			<Section id={ `${pageID}-filters` }>
				<div>Style</div>
				<div>Tabs</div>
			</Section>
			<Section id={ `${pageID}-content` }>
				<Grid gap="lg">
					{/* <PostsFeed group={ activeGroup } /> */}
					<Sidebar>
						<div>
							<div>
								Your Lineup
								<Link href="/community/events/lineup">See All</Link>
							</div>
						</div>
						<div>
							<div>
								Top Posts This Week
							</div>
						</div>
					</Sidebar>
				</Grid>
			</Section>
		</>
	)
}
