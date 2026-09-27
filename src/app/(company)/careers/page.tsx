'use client'

import { Grid, Section } from '@/components/layout'
import type { ReactNode } from 'react'

interface ComponentItem {
	id: string
	title: string
	content: ReactNode
}

const CULTURE_PILLARS: ComponentItem[] = [
	{
		id: 'goals',
		title: 'Craft over volume',
		content: 'We ship less, better. Nobody is measured on output theater.',
	},
	{
		id: 'expectations',
		title: 'Skin in the game',
		content: 'Everyone talks to artists and clients — support shifts included, founders too.',
	},
	{
		id: 'benefits',
		title: 'Honest terms',
		content: 'Salary bands published internally. Equity for every role. No surprise re-orgs.',
	},
]

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
