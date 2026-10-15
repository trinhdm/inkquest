import { Button } from '@/components/core/Button'
import { Section } from '@/components/layout/Section'

export const PressStory = () => {
	const pageID = 'press'

	return (
		<Section
			eyebrow="Our story"
			id={ `${pageID}-about` }
			layout="split"
			title="About Inkquest."
		>
			Inkquest is a marketplace and community connecting tattoo artists with clients. Clients search by style and distance, bid on flash designs and open booking slots, and book directly — with the artist setting the floor price on every piece. Founded in Brooklyn in 2024, Inkquest hosts more than 12,400 verified artists across 38 cities and has paid over $9.2M directly to artists.

			<Section.Footer>
				<Button action="copy" size="sm" variant="outline">
					Copy boilerplate
				</Button>
			</Section.Footer>
		</Section>
	)
}

PressStory.displayName = 'PressStory'
