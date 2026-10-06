import { createContext, use, useMemo, useState, type ReactNode } from 'react'
import type { NoExcessKeys } from '@/types/utils'

export interface PageProviderProps<T, V extends T = T> {
	children: ReactNode
	pageID?: string
	value: V & NoExcessKeys<T, V>
}

type UpdateCtxFn<T> =
	(next: Partial<T> | ((prev: T) => Partial<T>)) => void

type PageCtxValue<T> =
	T
	& Required<Pick<PageProviderProps<T>, 'pageID'>>
	& { updatePageCtx: UpdateCtxFn<T> }

type SafePageCtxValue<T> =
	| PageCtxValue<T>
	| null

export const createPageCtx = <T extends object>(id: string) => {
	const PageCtx = createContext<SafePageCtxValue<T>>(null)

	const PageProvider = <V extends T>({ children, value }: PageProviderProps<T, V>) => {
		const [pageState, setPageState] = useState<T>(() => value)

		const updatePageCtx = useMemo(() => (
			(next: Partial<T> | ((prev: T) => Partial<T>)) => {
				setPageState(prev => {
					const nextValues = typeof next === 'function' ? next(prev) : next
					return { ...prev, ...nextValues }
				})
			}
		), [])

		const ctxValue = useMemo(
			() => ({ ...pageState, pageID: id, updatePageCtx }),
			[pageState, updatePageCtx]
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
