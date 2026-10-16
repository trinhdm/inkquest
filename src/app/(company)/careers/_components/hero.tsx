import { useParser } from '@/hooks/useParser'
import { Section } from '@/components/layout/Section'
import type { CareersPageData } from '../_utils/careers.data'

export const CareersHero = ({ hero, id, title }: CareersPageData) => {
	return (
		<Section
			eyebrow={ hero?.eyebrow }
			id={ `${id}-${hero?.id}` }
			layout="hero"
			title={ hero?.heading ?? title }
		>
			{ useParser(hero?.body) }
		</Section>
	)
}

CareersHero.displayName = 'CareersHero'
