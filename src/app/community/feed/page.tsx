'use client'

import Link from 'next/link'
import { Button } from '@/components/core/Button'
import { Grid } from '@/components/layout/Grid'
import { Section } from '@/components/layout/Section'
import { Sidebar } from '@/components/layout/Sidebar'

export default function CommunityFeed() {
	const pageID = 'community-feed'

	return (
		<>
			<Section
				eyebrow="Your Circle, Live"
				id={ `${pageID}-hero` }
				layout="hero-split"
				title="Fresh ink today."
			>
				<>
					New work, healed check-ins, and flash drops from the artists you follow. Updated all day.
				</>

				<Section.Footer>
					<Button href="/careers" variant="outline">
						Share a post
					</Button>
				</Section.Footer>
			</Section>
			<Section id={ `${pageID}-filters` }>
				<div>Style</div>
				<div>Tabs</div>
			</Section>
			<Section id={ `${pageID}-content` }>
				<Grid gap="lg">
					<Sidebar>
						<div>
							<div>
								Your Circle
								<Link href="/community/feed/circle">See All</Link>
							</div>
						</div>
						<div>
							<div>
								Top Posts This Week
							</div>
						</div>
					</Sidebar>
					{/* <PostsFeed group={ activeGroup } /> */}
				</Grid>
			</Section>
		</>
	)
}
