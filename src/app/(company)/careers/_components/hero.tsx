import { useParser } from '@/hooks/useParser'
import { Section } from '@/components/layout/Section'
import type { CareersPageData } from '../_utils/careers.data'
import type { RequireSome } from '@/types/utils'

export const CareersHero = ({ hero, id }: RequireSome<CareersPageData, 'hero'>) => {
	return (
		<Section
			eyebrow={ hero.eyebrow }
			id={ `${id}-${hero.id}` }
			layout={ hero.layout ?? 'hero' }
			title={ hero.heading }
		>
			{ useParser(hero.body) }
		</Section>
	)
}

CareersHero.displayName = 'CareersHero'
