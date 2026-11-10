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

export const createPageCtx = <T extends object>(slug: string) => {
	const PageCtx = createContext<SafePageCtxValue<T>>(null)

	const PageProvider = <V extends T>({ children, value }: PageProviderProps<T, V>) => {
		const ctxValue = useMemo(() => ({ ...value, pageID: slug }), [value])
		return <PageCtx value={ ctxValue }>{ children }</PageCtx>
	}

	const usePageCtx = (component?: string): PageCtxValue<T> => {
		const context = use(PageCtx)

		if (context === null) {
			const subject = component ? `<${component} />` : 'This component'
			throw new Error(`${slug}: ${subject} must be rendered inside <${slug}>`)
		}

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
