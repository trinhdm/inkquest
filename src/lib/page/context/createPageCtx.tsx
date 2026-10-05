import { createContext, use, useMemo, type ReactNode } from 'react'
import type { NoExcessKeys } from '@/types/utils'

export interface PageProviderProps<T, V extends T = T> {
	children: ReactNode
	pageID?: string
	value: V & NoExcessKeys<T, V>
}

type PageCtxValue<T> =
	T & Required<Pick<PageProviderProps<T>, 'pageID'>>

type SafePageCtxValue<T> =
	| PageCtxValue<T>
	| null

export const createPageCtx = <T extends object>(id: string) => {
	const PageCtx = createContext<SafePageCtxValue<T>>(null)

	const PageProvider = <V extends T>({
		children,
		pageID,
		value,
	}: PageProviderProps<T, V>) => {
		const ctxValue = useMemo(
			() => ({ ...value, pageID: pageID ?? id }),
			[pageID, value]
		)

		return <PageCtx value={ ctxValue }>{ children }</PageCtx>
	}

	const usePageCtx = (name?: string): PageCtxValue<T> => {
		const context = use(PageCtx)
		if (context === null)
			throw new Error(`${id}: <${name ?? ''} /> must be rendered inside <${id}>`)
		return context
	}

	const useSafePageCtx = (): SafePageCtxValue<T> =>
		use(PageCtx)

	return {
		PageProvider,
		usePageCtx,
		useSafePageCtx,
	}
}
