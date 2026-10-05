'use client'

import { useOptimistic, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useFaqsCtx } from '../faqs.context'
import { extractText } from '@/lib/component'
import { FaqCategory } from '../FaqCategory'
import { FaqResults } from '../FaqResults'
import { Grid } from '@/components/layout/Grid'
import { Sidebar } from '@/components/layout/Sidebar'

import {
	faqCategoryUrl,
	resolveFaqGroup,
	FAQ_CATEGORIES,
	FAQ_ITEMS,
	type FaqGroup,
} from '../faqs.data'

const NAME = 'FaqBrowser'

const findTerms = (query: string): string[] =>
	query.split(/\s+/).filter(Boolean).map(term => term.toLowerCase())

const findGroups = (terms: string[]): FaqGroup[] => {
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

interface SearchFaqsResults {
	isSearching: boolean
	groups: FaqGroup[]
	terms: string[]
}

const searchFaqs = (query?: string | string[]): SearchFaqsResults => {
	const search = ((Array.isArray(query) ? query[0] : query) ?? '').trim(),
		isSearching = search.length > 0

	const terms = findTerms(search),
		groups = isSearching ? findGroups(terms) : []

	return { groups, isSearching, terms }
}

export const FaqBrowser = () => {
	const { params, scroll } = useFaqsCtx()

	const router = useRouter()
	const searchParams = useSearchParams()

	const urlID = searchParams.get(params.category) ?? undefined
	const [optimisticID, setOptimisticID] = useOptimistic(urlID)
	const [isPending, startTransition] = useTransition()
	const activeGroup = resolveFaqGroup(optimisticID)

	const selectCategory = (id: string) => {
		startTransition(() => {
			setOptimisticID(id)
			router.push(faqCategoryUrl(id), { scroll })
		})
	}

	const query = searchParams.get(params.query) ?? ''
	const { groups, isSearching, terms } = searchFaqs(query)

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
				scroll={ scroll }
			/>
			<FaqCategory group={ activeGroup } />
		</Grid>
	)
}

FaqBrowser.displayName = NAME
