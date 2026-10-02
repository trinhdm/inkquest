'use client'

import { useOptimistic, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FaqCategory } from '../FaqCategory'
import { Grid } from '@/components/layout/Grid'
import { Sidebar } from '@/components/layout/Sidebar'
import { FAQ_CATEGORIES, FAQ_PARAM, faqCategoryUrl, resolveFaqGroup } from '../faqs.data'

export const FaqBrowser = () => {
	const router = useRouter()
	const searchParams = useSearchParams()

	const urlID = searchParams.get(FAQ_PARAM) ?? undefined
	const [optimisticID, setOptimisticID] = useOptimistic(urlID)
	const [isPending, startTransition] = useTransition()

	const activeGroup = resolveFaqGroup(optimisticID)

	const selectCategory = (id: string) => {
		startTransition(() => {
			setOptimisticID(id)
			router.push(faqCategoryUrl(id), { scroll: false })
		})
	}

	return (
		<Grid attributes={ { aria: { busy: isPending || undefined } } } gap="lg">
			<Sidebar
				active={ activeGroup.id }
				items={ FAQ_CATEGORIES }
				onItemChange={ selectCategory }
			/>
			<FaqCategory { ...activeGroup } />
		</Grid>
	)
}
