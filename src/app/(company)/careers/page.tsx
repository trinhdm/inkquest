'use client'

import { Badge } from '@/components/core/Badge'
import { Button } from '@/components/core/Button'
import { Grid } from '@/components/layout/Grid'
import { Section } from '@/components/layout/Section'
import { Table } from '@/components/data/Table'
import { CULTURE_PILLARS, HIRING_STEPS, OPEN_POSITIONS } from './careers.data'

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
				We&apos;re a team of fourteen building the place where tattoo work gets found, priced, and booked on the artist&apos;s terms. Half of us are tattooed. All of us ship.
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
							<div className="inkq-rail" />
							<h3 className="inkq-h5">{ title }</h3>
							<p>{ content }</p>
						</Grid.Item>
					)) }
				</Grid>
			</Section>

			<Section
				eyebrow="Open roles"
				id={ `${pageID}-list` }
				title="Join the crew."
			>
				<Table>
					{ OPEN_POSITIONS.map(({
						department,
						id,
						title,
						url,
					}) => {

						return (
							<Table.Row key={ `press-${id}` }>
								<Table.Cell>
									<span className="inkq-h5">{ title }</span>
								</Table.Cell>
								<Table.Cell>
									<Badge variant="dark">{ department }</Badge>
									<Button
										href={ url }
										size="sm"
										variant="outline"
									>
										View Role
									</Button>
								</Table.Cell>
							</Table.Row>
						)
					}) }
				</Table>

				<Section.Footer>
					<Button variant="outline">See all roles</Button>
				</Section.Footer>
			</Section>

			<Section
				eyebrow="How hiring works"
				id={ `${pageID}-steps` }
				title="Four steps. No mazes."
			>
				<Grid columns={ 4 }>
					{ HIRING_STEPS.map(({ content, id, title }, i) => {
						const index = i + 1,
							step = index > 9 ? index : `0${index}`

						return (
							<Grid.Item
								key={ `${id}-pillar` }
								className="inkq-item--step"
							>
								<div className="inkq-rail" />
								<span className="inkq-eyebrow">{ step }</span>
								<h3 className="inkq-h5">{ title }</h3>
								<p>{ content }</p>
							</Grid.Item>
						)
					}) }
				</Grid>
			</Section>
		</>
	)
}
