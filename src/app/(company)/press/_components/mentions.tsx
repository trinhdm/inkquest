import Link from 'next/link'
import { formatDate } from '@/utils/helpers'
import { Section } from '@/components/layout/Section'
import { Table } from '@/components/data/Table'
import { PRESS_HISTORY } from '../_utils/press.data'

export const PressMentions = () => {
	const pageID = 'press'
	if (!PRESS_HISTORY.length) return null

	return (
		<Section
			eyebrow="Mentions"
			id={ `${pageID}-history` }
			title="Past press mentions."
		>
			<Table>
				{ PRESS_HISTORY.map(({
					author, id,
					publishDate,
					title, url,
				}) => {
					const date = formatDate(publishDate, true),
						headline = `"${title.replace(/^['"]|['"]$/g, '')}"`

					return (
						<Table.Row className="mention" key={ `press-${id}` }>
							{ author && (
								<Table.Cell className="mention__author">
									<strong>{ author }</strong>
								</Table.Cell>
							) }

							<Table.Cell className="mention__title">
								{ !!url
									? <Link href={ url }>{ headline }</Link>
									: <span>{ headline }</span> }
							</Table.Cell>

							{ !!date.length && (
								<Table.Cell>
									<span className="mention__date">{ date }</span>
								</Table.Cell>
							) }
						</Table.Row>
					)
				}) }
			</Table>
		</Section>
	)
}

PressMentions.displayName = 'PressMentions'
