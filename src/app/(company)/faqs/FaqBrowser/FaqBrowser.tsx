'use client'

import { useOptimistic, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { extractText } from '@/lib/component'
import { FaqCategory } from '../FaqCategory'
import { FaqResults } from '../FaqResults'
import { Grid } from '@/components/layout/Grid'
import { Sidebar } from '@/components/layout/Sidebar'

import {
	FAQ_CATEGORIES,
	FAQ_CATEGORY_PARAM,
	FAQ_ITEMS,
	FAQ_QUERY_PARAM,
	faqCategoryUrl,
	resolveFaqGroup,
	type FaqGroup,
} from '../faqs.data'

const searchTerms = (query?: string | string[]): string[] => {
	const search = (Array.isArray(query) ? query[0] : query) ?? ''
	return search.trim().split(/\s+/).filter(Boolean).map(term => term.toLowerCase())
}

const searchFaqs = (query?: string | string[]): FaqGroup[] => {
	const terms = searchTerms(query)
	if (!terms.length) return []

	return FAQ_ITEMS.reduce<FaqGroup[]>((acc, group) => {
		const questions = group.questions.filter(({ content, title }) => {
			const haystack = `${title}${extractText(content)}`.toLowerCase()
			return terms.every(term => haystack.includes(term))
		})

		if (questions.length) acc.push({ ...group, questions })
		return acc
	}, [])
}

export const FaqBrowser = () => {
	const router = useRouter()
	const searchParams = useSearchParams()

	const urlID = searchParams.get(FAQ_CATEGORY_PARAM) ?? undefined
	const [optimisticID, setOptimisticID] = useOptimistic(urlID)
	const [isPending, startTransition] = useTransition()
	const activeGroup = resolveFaqGroup(optimisticID)

	const selectCategory = (id: string) => {
		startTransition(() => {
			setOptimisticID(id)
			router.push(faqCategoryUrl(id), { scroll: false })
		})
	}

	const query = searchParams.get(FAQ_QUERY_PARAM) ?? ''
	const isSearching = query.trim().length > 0
	const terms = searchTerms(query)
	const groups = isSearching ? searchFaqs(query) : []

	if (isSearching) {
		return (
			<FaqResults
				groups={ groups }
				key={ query }
				query={ query }
				terms={ terms }
			/>
		)
	}

	return (
		<Grid attributes={ { aria: { busy: isPending || undefined } } } gap="lg">
			<Sidebar
				active={ activeGroup.id }
				items={ FAQ_CATEGORIES }
				onItemChange={ selectCategory }
			/>
			<FaqCategory group={ activeGroup } />
		</Grid>
	)
}
