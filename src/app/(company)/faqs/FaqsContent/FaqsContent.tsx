'use client'

import { Suspense } from 'react'
import { useFaqsCtx } from '../faqs.context'
import { resolveFaqGroup } from '../faqs.data'
import { FaqBrowser } from './FaqBrowser'
import { FaqCategory } from './FaqCategory'
import { Section } from '@/components/layout/Section'

export const FaqsContent = () => {
	const { pageID } = useFaqsCtx()
	const initGroup = resolveFaqGroup()

	return (
		<Section id={ `${pageID}-content` }>
			<Suspense fallback={ <FaqCategory group={ initGroup } /> }>
				<FaqBrowser />
			</Suspense>
		</Section>
	)
}

FaqsContent.displayName = 'FaqsContent'
