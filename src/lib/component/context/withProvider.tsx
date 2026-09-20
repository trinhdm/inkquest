import { Fragment, type ReactNode } from 'react'
import { getChildKey } from './children'
import type { NoExcessKeys } from '@/types/utils'
import type { RootProviderFn } from './createRootCtx'

export const withProvider = <T, V extends T>(
	items: ReactNode[],
	Provider: RootProviderFn<T> | undefined,
	values: (V & NoExcessKeys<T, V>)[]
): ReactNode[] => items.map((child, index) => {
    const key = getChildKey(child, index)

    if (Provider)
        return <Provider key={ key } value={ values[index] }>{ child }</Provider>

    return <Fragment key={ key }>{ child }</Fragment>
})
