import { useState } from 'react'
import { formatDate } from '@/utils/helpers'
import { Accordion } from '@/components/data/Accordion'
import type { SharedLegalProps } from '../../_utils/legal.types'

export const LegalChangelog = ({ data }: SharedLegalProps<'changelog'>) => {
	const [open, setOpen] = useState(false)
	if (!data.length) return null

	return (
		<Accordion
			indicatorPosition="left"
			layout="blockquote"
			open={ open }
			onToggle={ setOpen }
		>
			<Accordion.Title>
				{ open ? 'Hide' : 'Show' } version history
			</Accordion.Title>

			<Accordion.Content>
				<ul className="changelog__list">
					{ data.map(({ id, release_date, summary, version }) => {
						const date = formatDate(release_date)

						return (
							<li key={ `${version}-${id}` }>
								<div className="changelog__overview">
									<strong>V{ String(version) }</strong>
									{ !!date.length && <span>{ date }</span> }
								</div>
								{ !!summary && <p className="changelog__note">{ summary }</p> }
							</li>
						)
					}) }
				</ul>
			</Accordion.Content>
		</Accordion>
	)
}

LegalChangelog.displayName = 'LegalChangelog'
