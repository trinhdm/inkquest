import { createPageCtx } from '@/lib/page/context'
import type { LinkProps } from 'next/link'

interface FaqsParams {
	category: string
	query: string
}

export interface FaqsContext<T extends string = string>
	extends Pick<LinkProps<T>, 'scroll'> {
	params: FaqsParams
}

export const {
	PageProvider: FaqsProvider,
	usePageCtx: useFaqsCtx,
} = createPageCtx<FaqsContext>('faqs')
