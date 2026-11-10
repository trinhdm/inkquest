import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDebounce } from '@/hooks/useDebounce'
import { useFaqsCtx, type FaqsContext } from '../../_utils/faqs.context'
import { Field } from '@/components/form/Field'
import type { ChangeEventHandler } from 'react'
import type { Route } from 'next'

interface FaqsUrlParams {
	category?: string
	params: FaqsContext['params']
	query?: string
}

// Builds the one URL every category link, sidebar navigation, and search
// keystroke all resolve through. Falsy values are omitted from the
// `URLSearchParams` entirely (not written as `category=`/`q=`) so clearing
// the search field — or navigating with no category selected — lands on a
// clean `/faqs`, never `/faqs?q=` or `/faqs?category=`.
export const faqsUrl = ({ category, params, query }: FaqsUrlParams): Route => {
	const urlParams = new URLSearchParams()

	if (category) urlParams.set(params.category, category)
	if (query) urlParams.set(params.query, query)

	const search = urlParams.toString()

	// keeps the template-literal return form (not `as Route`) — this
	// is what satisfies `typedRoutes` today, same as the original `faqCategoryUrl`
	return `/faqs${search ? `?${search}` : ''}` as Route
}

interface FaqSearchProps {
	id: string
}

export const FaqSearch = ({ id }: FaqSearchProps) => {
	const {
		data: { search: { field } },
		params, scroll,
	} = useFaqsCtx()

	const router = useRouter()
	const searchParams = useSearchParams()

	// Seeded once from the URL so a hard reload of `/faqs?q=deposit` lands
	// with the field pre-filled. Every keystroke after that is this
	// component's own local state, never read back from `searchParams` — see
	// the comment on `pushQuery` below for why no resync effect is needed.
	const [draft, setDraft] = useState(() => searchParams.get(params.query) ?? '')

	const { debounce: debounceQuery } = useDebounce((query: string) => {
		const category = searchParams.get(params.category) ?? undefined
		router.replace(faqsUrl({ category, params, query }), { scroll })
	})

	// No effect syncs `draft` back from `searchParams` after mount:
	// `router.replace` here is the ONLY thing that ever writes `?q=`, and
	// `FaqBrowser` unmounts the sidebar entirely while searching — so there is
	// no other control in the tree that could write a competing value for
	// this component to reconcile against.
	const handleChange: ChangeEventHandler<HTMLInputElement> = event => {
		const { value } = event.target
		setDraft(value)
		debounceQuery(value)
	}

	return (
		<Field id={ id } size="lg">
			<Field.Input
				{ ...field }
				onChange={ handleChange }
				type="search"
				value={ draft }
			/>
		</Field>
	)
}

FaqSearch.displayName = 'FaqSearch'
