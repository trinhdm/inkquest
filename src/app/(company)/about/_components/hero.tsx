import { Button } from '@/components/core/Button'
import { Section } from '@/components/layout/Section'

export const AboutHero = () => {
	const pageID = 'about'

	return (
		<Section
			eyebrow="About · Est. 2024 · Brooklyn, NY"
			id={ `${pageID}-hero` }
			layout="hero"
			title="The work comes first."
		>
			Inkquest is a marketplace and community connecting tattoo artists with clients — search by style and distance, bid on flash designs and open slots, and book directly.

			<Section.Footer>
				<Button href="/discover">Find your artist</Button>
				<Button href="/careers">See open roles</Button>
			</Section.Footer>
		</Section>
	)
}

AboutHero.displayName = 'AboutHero'
