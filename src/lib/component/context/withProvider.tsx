import { Fragment, type ReactNode } from 'react'
import { getChildKey } from '../children'
import type { NoExcessKeys } from '@/types/utils'
import type { RootProviderFn } from './createCompoundCtx'

export const withProvider = <
	T,
	V extends T,
	N extends string = string,
>(
	items: ReactNode[],
	Provider: RootProviderFn<T, N> | undefined,
	values: (V & NoExcessKeys<T, V>)[],
): ReactNode[] =>
    items.map((child, index) => {
		if (process.env.NODE_ENV !== 'production' && Provider && values.length !== items.length)
			console.error(`withProvider: got ${items.length} items but ${values.length} values`)

		const key = getChildKey(child, index)

		return !!Provider
			? <Provider key={ key } value={ values[index] }>{ child }</Provider>
			: <Fragment key={ key }>{ child }</Fragment>
	})
