'use client'

import { Grid } from '@/components/layout/Grid'
import { Section } from '@/components/layout/Section'
import { CULTURE_PILLARS } from './careers.data'

export default function Careers() {
	const pageID = 'careers'

	return (
		<>
			<Section
				eyebrow="Careers · Brooklyn + remote"
				id={ `${pageID}-hero` }
				layout="hero"
				title="Small crew, sharp needles."
			>
				We're a team of fourteen building the place where tattoo work gets found, priced, and booked on the artist's terms. Half of us are tattooed. All of us ship.
			</Section>

			<Section
				id={ `${pageID}-culture` }
				// layout="blocks"
			>
				<Grid columns={ 3 }>
					{ CULTURE_PILLARS.map(({ content, id, title }) => (
						<Grid.Item
							key={ `${id}-pillar` }
							className="inkq-item--block"
						>
							<span className="inkq-rail" />
							<h3 className="inkq-h4">{ title }</h3>
							<p>{ content }</p>
						</Grid.Item>
					)) }
				</Grid>
			</Section>
		</>
	)
}
