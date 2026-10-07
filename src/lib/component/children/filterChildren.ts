import {
	isValidElement,
	Children,
	Fragment,
	type ComponentType,
	type ReactNode,
} from 'react'

import type { WithChildren } from './types'

export const countChildren = (
	children: ReactNode,
	displayName?: string,
): number => {
	if (!displayName) return Children.count(children)

	return Children.toArray(children).reduce<number>((count, child) => {
		if (isValidElement<WithChildren>(child)) {
			if (child.type === Fragment)
				return count + countChildren(child.props.children, displayName)
			if (displayName === (child.type as ComponentType).displayName)
				return count + 1
		}

		return count
	}, 0)
}

interface BaseVerifyChildren {
	children: ReactNode
	name: string
}

interface VerifyExtraChildren {
	extra: ReactNode[]
	max?: number
	total?: number
}

interface VerifyMaxChildren {
	extra?: ReactNode[]
	max: number
	total?: number
}

interface VerifyTotalChildren {
	extra?: ReactNode[]
	max?: number
	total: number
}

type VerifyChildrenVariations =
	| VerifyExtraChildren
	| VerifyMaxChildren
	| VerifyTotalChildren

type VerifyChildrenArgs =
	& BaseVerifyChildren
	& VerifyChildrenVariations

export const verifyChildren = ({
	children,
	extra,
	max,
	name,
	total,
}: VerifyChildrenArgs) => {
	if (process.env.NODE_ENV === 'production') return

	const count = countChildren(children),
		foundText = `${name}: ${count} children found`

	if (max) {
		if (count < max + 1) return
		console.warn(`${foundText}; a ${name} needs less than ${max} children.`)
	} else if (total) {
		if (count === total) return
		console.warn(`${foundText}; a ${name} needs exactly ${total} children.`)
	} else if (!!extra?.length) {
		console.warn(`${name}: ${extra?.length} extra subcomponent(s) found.`)
	}
}

export const filterChildren = (
	children: ReactNode,
	displayName: string | string[],
	verifyArgs?: Omit<VerifyChildrenArgs, 'children'>,
): ReactNode[] => {
	const filtered: ReactNode[] = Array.isArray(displayName)
		? Array(displayName.length).fill(null)
		: []

	Children.toArray(children).forEach(child => {
		if (isValidElement<WithChildren>(child)) {
			if (!child.type) return

			if (child.type === Fragment) {
				filterChildren(child.props.children, displayName).forEach((nested, i) => {
					if (nested == null) return
					if (typeof displayName === 'string') filtered.push(nested)
					else if (filtered[i] == null) filtered[i] = nested
				})
				return
			}

			const { displayName: childName } = child.type as ComponentType
			if (!childName) return

			if (typeof displayName === 'string') {
				if (childName !== displayName) return
				filtered.push(child)
			} else if (Array.isArray(displayName)) {
				const i = displayName.indexOf(childName)
				if (i < 0 || filtered[i] != null) return
				filtered[i] = child
			}
		}
	})

	if (verifyArgs) verifyChildren({ ...verifyArgs, children: filtered.filter(Boolean) } as VerifyChildrenArgs)
	return filtered
}
