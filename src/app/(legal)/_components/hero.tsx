import { formatDate } from '@/utils/helpers'
import { Button } from '@/components/core/Button'
import { LegalChangelog } from './_features/changelog'
import { Section } from '@/components/layout/Section'
import { SEPARATOR } from '@/utils/constants'
import type { LegalPageData } from '../_utils/legal.types'

export const LegalHero = ({
	changelog,
	effective_date,
	hero,
	id: pageID,
	title,
	updated_date,
}: LegalPageData) => {
	const dates = [],
		effective = formatDate(effective_date),
		updated = formatDate(updated_date)

	if (updated.length) dates.push(`Last updated ${updated}`)
	if (effective.length) dates.push(`Effective ${effective}`)

	return (
		<Section
			className="changelog"
			eyebrow={ dates.join(SEPARATOR) }
			id={ `${pageID}-hero` }
			layout="hero-tight"
			title={ hero?.heading ?? title }
		>
			<LegalChangelog data={ changelog } />

			<Section.Footer>
				<Button action="print" size="sm" variant="outline">Print</Button>
			</Section.Footer>
		</Section>
	)
}

LegalHero.displayName = 'LegalHero'
