import { Suspense } from 'react'
import { useFaqsCtx } from '../_utils/faqs.context'
import { resolveFaqGroup } from '../_utils'
import { FaqBrowser } from './_features/browser'
import { FaqCategory } from './_features/category'
import { Section } from '@/components/layout/Section'

export const FaqsContent = () => {
	const {
		data: { items },
		pageID,
	} = useFaqsCtx()

	const initGroup = resolveFaqGroup(items)

	return (
		<Section id={ `${pageID}-content` }>
			<Suspense fallback={ <FaqCategory group={ initGroup } /> }>
				<FaqBrowser />
			</Suspense>
		</Section>
	)
}

FaqsContent.displayName = 'FaqsContent'
