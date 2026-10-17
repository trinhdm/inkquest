import { useOptimistic, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useFaqsCtx } from '../../_utils/faqs.context'
import { extractText } from '@/lib/component/children'
import { resolveFaqGroup } from '../../_utils'
import { FaqCategory } from './category'
import { FaqResults } from './results'
import { Grid } from '@/components/layout/Grid'
import { Sidebar } from '@/components/layout/Sidebar'
import type { Route } from 'next'
import type { FaqGroup, FaqsPageData } from '../../_utils/faqs.data'

const getCategoryUrl = (id: string, param: string): Route =>
	`/faqs?${param}=${id}`

const findCategories = (
	content: FaqsPageData['content'],
	param: string,
): Sidebar.Item.Link[] =>
	content.map(({ category, id }) => ({
		id,
		label: category,
		url: getCategoryUrl(id, param),
	}))

const findTerms = (query: string): string[] =>
	query.split(/\s+/).filter(Boolean).map(term => term.toLowerCase())

const findGroups = (
	content: FaqsPageData['content'],
	terms: string[],
): FaqGroup[] => {
	if (!terms.length) return []

	return content.reduce<FaqGroup[]>((acc, group) => {
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

const searchFaqs = (
	items: FaqsPageData['content'],
	query?: string | string[],
): SearchFaqsResults => {
	const search = ((Array.isArray(query) ? query[0] : query) ?? '').trim(),
		isSearching = search.length > 0

	const terms = findTerms(search),
		groups = isSearching ? findGroups(items, terms) : []

	return { groups, isSearching, terms }
}

export const FaqBrowser = () => {
	const {
		data: { content },
		params, scroll,
	} = useFaqsCtx()

	const router = useRouter()
	const searchParams = useSearchParams()

	const urlID = searchParams.get(params.category) ?? undefined
	const [optimisticID, setOptimisticID] = useOptimistic(urlID)
	const [isPending, startTransition] = useTransition()

	const activeGroup = resolveFaqGroup(content, optimisticID)
	const categories = findCategories(content, params.category)

	const selectCategory = (id: string) => {
		startTransition(() => {
			setOptimisticID(id)
			router.push(getCategoryUrl(id, params.category), { scroll })
		})
	}

	const query = searchParams.get(params.query) ?? ''
	const { groups, isSearching, terms } = searchFaqs(content, query)

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
		<Grid
			attributes={ { aria: { busy: isPending || undefined } } }
			layout="sidebar"
		>
			<Sidebar
				active={ activeGroup.id }
				items={ categories }
				onChange={ selectCategory }
				scroll={ scroll }
			/>

			<FaqCategory group={ activeGroup } />
		</Grid>
	)
}

FaqBrowser.displayName = 'FaqBrowser'
