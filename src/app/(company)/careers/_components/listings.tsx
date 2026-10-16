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
					location,
					title, url,
				}) => {
					const deptProps = {}

					if (department) {
						const badgeCode = ['dark', 'light'].includes(department.code)
							? 'variant' : 'tone'
						Object.assign(deptProps, { [`${badgeCode}`]: department.code })
					}

					return (
						<Table.Row className="job" key={ `press-${id}` }>
							<Table.Cell>
								<span className="inkq-h5 job__role">{ title }</span>
							</Table.Cell>

							<Table.Cell>
								{ department && (
									<Badge { ...deptProps } className="job__dept">
										{ department.name }
									</Badge>
								) }

								{ location && (
									<span className="job__location">{ location }</span>
								) }

								<Button
									className="job__btn"
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
