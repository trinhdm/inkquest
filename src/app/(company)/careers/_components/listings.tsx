import { Badge } from '@/components/core/Badge'
import { Button } from '@/components/core/Button'
import { Section } from '@/components/layout/Section'
import { Table } from '@/components/data/Table'
import { OPEN_POSITIONS } from '../_utils/careers.data'

export const CareersListings = () => {
	const pageID = 'careers'
	if (!OPEN_POSITIONS.length) return null

	return (
		<Section
			eyebrow="Open roles"
			id={ `${pageID}-list` }
			title="Join the crew."
		>
			<Table>
				{ OPEN_POSITIONS.map(({
					department, id,
					title, url,
				}) => {
					return (
						<Table.Row key={ `press-${id}` }>
							<Table.Cell>
								<span className="inkq-h5">{ title }</span>
							</Table.Cell>

							<Table.Cell>
								{ department && <Badge variant="dark">{ department }</Badge> }
								<Button href={ url } size="sm" variant="outline">
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
	)
}

CareersListings.displayName = 'CareersListings'
