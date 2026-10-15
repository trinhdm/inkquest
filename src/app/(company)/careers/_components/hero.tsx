import { Section } from '@/components/layout/Section'

export const CareersHero = () => {
	const pageID = 'careers'

	return (
		<Section
			eyebrow="Careers · Brooklyn + remote"
			id={ `${pageID}-hero` }
			layout="hero"
			title="Small crew, sharp needles."
		>
			We&apos;re a team of fourteen building the place where tattoo work gets found, priced, and booked on the artist&apos;s terms. Half of us are tattooed. All of us ship.
		</Section>
	)
}

CareersHero.displayName = 'CareersHero'
