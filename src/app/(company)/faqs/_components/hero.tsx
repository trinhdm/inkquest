import { Suspense } from 'react'
import { useFaqsCtx } from '../_utils/faqs.context'
import { useParser } from '@/hooks/useParser'
import { FaqSearch } from './_features/search'
import { Field } from '@/components/form/Field'
import { Section } from '@/components/layout/Section'

export const FaqsHero = () => {
	const {
		data: { hero, search: { field }, title },
		pageID,
	} = useFaqsCtx()

	const searchID = `${pageID}-search`

	return (
		<Section
			eyebrow={ hero?.eyebrow }
			id={ `${pageID}-hero` }
			layout="hero"
			title={ hero?.heading ?? title }
		>
			{ useParser(hero?.body) }

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
