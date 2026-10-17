import { Suspense } from 'react'
import { useFaqsCtx, type FaqsContext } from '../_utils/faqs.context'
import { useParser } from '@/hooks/useParser'
import { FaqSearch } from './_features/search'
import { Field } from '@/components/form/Field'
import { Section } from '@/components/layout/Section'
import type { RequireSome } from '@/types/utils'

export const FaqsHero = () => {
	const { data, pageID } = useFaqsCtx()

	const {
		hero,
		search: { field },
	} = data as RequireSome<FaqsContext['data'], 'hero'>

	const searchID = `${pageID}-search`

	return (
		<Section
			eyebrow={ hero.eyebrow }
			id={ `${pageID}-${hero.id}` }
			layout={ hero.layout ?? 'hero' }
			title={ hero.heading }
		>
			{ useParser(hero.body) }

			<Section.Footer>
				<Suspense fallback={ (
					<Field disabled id={ searchID } size="lg">
						<Field.Input { ...field } type="search" />
					</Field>
				) }>
					<FaqSearch id={ searchID } />
				</Suspense>
			</Section.Footer>
		</Section>
	)
}

FaqsHero.displayName = 'FaqsHero'
