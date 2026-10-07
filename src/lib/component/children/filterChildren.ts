import {
	isValidElement,
	Children,
	Fragment,
	type ComponentType,
	type ReactNode,
} from 'react'

import { countChildren } from './countChildren'
import type { WithChildren } from './types'

interface VerifyChildrenArgs {
	children: ReactNode
	max?: number
	name: string
	repeated?: ReactNode[]
	total?: number
	unrelated?: ReactNode[]
}

type VerifyArgs =
	Pick<VerifyChildrenArgs, 'max' | 'name' | 'total'>

const labelChild = (child: ReactNode) => {
	if (!isValidElement(child)) return `text "${String(child).trim().slice(0, 24)}"`
	if (typeof child.type === 'string') return `<${child.type}>`
	return (child.type as ComponentType).displayName ?? 'unnamed component'
}

export const verifyChildren = ({
	children,
	max,
	name,
	repeated = [],
	total,
	unrelated = [],
}: VerifyChildrenArgs) => {
	if (process.env.NODE_ENV === 'production') return

	const count = countChildren(children),
		foundText = `${name}: ${count} children found`

	if (max && count > max)
		console.warn(`${foundText}; a ${name} needs less than ${max + 1} children.`)

	if (total && count !== total)
		console.warn(`${foundText}; a ${name} needs exactly ${total} children.`)

	if (repeated.length)
		console.warn(`${name}: ignored repeated ${repeated.map(labelChild).join(', ')}; only the first is used.`)

	if (unrelated.length)
		console.warn(`${name}: ignored unrelated ${unrelated.map(labelChild).join(', ')}.`)
}

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
