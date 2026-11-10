import {
	isValidElement,
	Children,
	Fragment,
	type ComponentType,
	type ReactNode,
} from 'react'

import { verifyChildren } from './verifyChildren'
import type { VerifyChildrenArgs } from './verifyChildren'
import type { WithChildren } from './types'

interface SortedChildren {
	filtered: ReactNode[]
	repeated: ReactNode[]
	unrelated: ReactNode[]
}

const sortChildren = (
	children: ReactNode,
	displayName: string | string[],
	sorted: SortedChildren,
) => {
	Children.toArray(children).forEach(child => {
		if (typeof child === 'string' && !child.trim()) return

		if (isValidElement<WithChildren>(child) && child.type === Fragment) {
			sortChildren(child.props.children, displayName, sorted)
			return
		}

		const childName = isValidElement(child)
			? (child.type as ComponentType).displayName
			: undefined

		if (typeof displayName === 'string') {
			if (childName === displayName) sorted.filtered.push(child)
			else sorted.unrelated.push(child)
			return
		}

		const i = childName ? displayName.indexOf(childName) : -1

		if (i < 0) sorted.unrelated.push(child)
		else if (sorted.filtered[i] != null) sorted.repeated.push(child)
		else sorted.filtered[i] = child
	})
}

type VerifyArgs =
	Pick<VerifyChildrenArgs, 'max' | 'name' | 'total'>

export const filterChildren = (
	children: ReactNode,
	displayName: string | string[],
	verifyArgs?: VerifyArgs,
): ReactNode[] => {
	const sorted: SortedChildren = {
		filtered: Array.isArray(displayName) ? Array(displayName.length).fill(null) : [],
		repeated: [],
		unrelated: [],
	}

	sortChildren(children, displayName, sorted)

	if (verifyArgs) verifyChildren({ ...verifyArgs, ...sorted, children: sorted.filtered })
	return sorted.filtered
}
