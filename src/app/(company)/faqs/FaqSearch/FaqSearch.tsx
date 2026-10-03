'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDebounce } from '@/hooks/useDebounce'
import { Field } from '@/components/form/Field'
import { FAQ_CATEGORY_PARAM, FAQ_QUERY_PARAM } from '../faqs.data'
import type { ChangeEventHandler } from 'react'
import type { Route } from 'next'

interface FaqsUrlParams {
	category?: string
	query?: string
}

// Builds the one URL every category link, sidebar navigation, and search
// keystroke all resolve through. Falsy values are omitted from the
// `URLSearchParams` entirely (not written as `category=`/`q=`) so clearing
// the search field — or navigating with no category selected — lands on a
// clean `/faqs`, never `/faqs?q=` or `/faqs?category=`.
export const faqsUrl = ({ category, query }: FaqsUrlParams): Route<string> => {
	const params = new URLSearchParams()

	if (category) params.set(FAQ_CATEGORY_PARAM, category)
	if (query) params.set(FAQ_QUERY_PARAM, query)

	const search = params.toString()

	// keeps the template-literal return form (not `as Route<string>`) — this
	// is what satisfies `typedRoutes` today, same as the original `faqCategoryUrl`
	return `/faqs${ search ? `?${ search }` : '' }` as Route<string>
}

export const FaqSearch = () => {
	const router = useRouter()
	const searchParams = useSearchParams()

	// Seeded once from the URL so a hard reload of `/faqs?q=deposit` lands
	// with the field pre-filled. Every keystroke after that is this
	// component's own local state, never read back from `searchParams` — see
	// the comment on `pushQuery` below for why no resync effect is needed.
	const [draft, setDraft] = useState(() => searchParams.get(FAQ_QUERY_PARAM) ?? '')

	const { debounced: pushQuery } = useDebounce((query: string) => {
		const category = searchParams.get(FAQ_CATEGORY_PARAM) ?? undefined
		router.replace(faqsUrl({ category, query }), { scroll: false })
	})

	// No effect syncs `draft` back from `searchParams` after mount:
	// `router.replace` here is the ONLY thing that ever writes `?q=`, and
	// `FaqBrowser` unmounts the sidebar entirely while searching — so there is
	// no other control in the tree that could write a competing value for
	// this component to reconcile against.
	const handleChange: ChangeEventHandler<HTMLInputElement> = event => {
		const { value } = event.target
		setDraft(value)
		pushQuery(value)
	}

	return (
		<Field id="faq-search">
			<Field.Input
				onChange={ handleChange }
				placeholder="Search all FAQs…"
				type="search"
				value={ draft }
			/>
		</Field>
	)
}

