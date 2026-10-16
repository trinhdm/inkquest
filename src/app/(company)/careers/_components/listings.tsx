import { Badge } from '@/components/core/Badge'
import { Button } from '@/components/core/Button'
import { Section } from '@/components/layout/Section'
import { Table } from '@/components/data/Table'
import type { ContentData, JobItem } from '@/types/shared'

export const CareersListings = ({
	body,
	buttons,
	eyebrow,
	heading,
	id,
}: ContentData<JobItem[]>) => {
	if (!body?.length) return null

	return (
		<Section
			eyebrow={ eyebrow }
			id={ id }
			title={ heading }
		>
			<Table>
				{ body.map(({
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

			{ buttons?.length && (
				<Section.Footer>
					{ buttons.map(({ id, label, url, ...props }) => (
						<Button key={ id } href={ url } { ...props }>{ label }</Button>
					)) }
				</Section.Footer>
			) }
		</Section>
	)
}

CareersListings.displayName = 'CareersListings'
