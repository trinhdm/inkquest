import { formatDate } from '@/utils/helpers'
import { Button } from '@/components/core/Button'
import { LegalChangelog } from './_features/changelog'
import { Section } from '@/components/layout/Section'
import { SEPARATOR } from '@/utils/constants'
import type { LegalPageData } from '../_utils/legal.types'
import type { RequireSome } from '@/types/utils'

export const LegalHero = ({
	changelog,
	effective_date,
	hero,
	id: pageID,
	updated_date,
}: RequireSome<LegalPageData, 'hero'>) => {
	const dates = [],
		effective = formatDate(effective_date),
		updated = formatDate(updated_date)

	if (updated.length) dates.push(`Last updated ${updated}`)
	if (effective.length) dates.push(`Effective ${effective}`)

	return (
		<Section
			className="changelog"
			eyebrow={ dates.join(SEPARATOR) }
			id={ `${pageID}-${hero.id}` }
			layout={ hero.layout ?? 'hero-tight' }
			title={ hero.heading }
		>
			<LegalChangelog data={ changelog } />

			<Section.Footer>
				<Button action="print" size="sm" variant="outline">Print</Button>
			</Section.Footer>
		</Section>
	)
}

LegalHero.displayName = 'LegalHero'
