import { Fragment, type ReactNode } from 'react'
import { getChildKey } from '@/utils/helpers'
import type { NoExcessKeys } from '@/types/utils'
import type { RootCxtProviderFn } from './createRootCxt'

export const renderWithProvider = <T, V extends T>(
	items: ReactNode[],
	Provider: RootCxtProviderFn<T> | undefined,
	values: (V & NoExcessKeys<T, V>)[]
): ReactNode[] => items.map((child, index) => {
    const key = getChildKey(child, index)

    if (Provider)
        return <Provider key={ key } value={ values[index] }>{ child }</Provider>

    return <Fragment key={ key }>{ child }</Fragment>
})
