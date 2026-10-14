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
	children?: ReactNode
	max?: number
	name: string | VerifySubcomponentsConfig
	repeated?: ReactNode[]
	total?: number
	unrelated?: ReactNode[]
}

interface VerifySubcomponentsConfig {
	childName: string | string[]
	parentName: string
}

type VerifyArgs =
	Pick<VerifyChildrenArgs, 'max' | 'name' | 'total'>

const labelChild = (child: ReactNode) => {
	if (typeof child === 'string') return child.trim()
	else if (!isValidElement(child)) return `text '${String(child).trim().slice(0, 24)}'`
	else if (typeof child.type === 'string') return `<${child.type}>`
	return (child.type as ComponentType).displayName ?? 'unnamed component'
}

const labelChildren = (children: ReactNode) =>
	(Array.isArray(children) ? children.map(labelChild).join(', ') : `${children}`).trim()

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
		displayName = typeof name === 'string' ? name : name.parentName

	let childNames,
		foundText = `${displayName}: ${count}`

	if (typeof name === 'object') {
		const { childName } = name,
			list = Array.isArray(childName) ? [...childName] : [childName]

		childNames = ` ${list.map(labelChild).join(', ')}`
		foundText += childNames
	}

	const hasMax = typeof max === 'number' && max > -1,
		isMaxed = hasMax && count > max

	const hasTotal = typeof total === 'number' && total > -1,
		isTotal = hasTotal && count !== total

	foundText += ` children found; a ${displayName} needs`

	if (isMaxed)
		console.warn(`${foundText} less than ${max + 1}${childNames ?? ''} children.`)

	if (isTotal)
		console.warn(`${foundText} exactly ${total}${childNames ?? ''} children.`)

	if (repeated.length)
		console.warn(`${displayName}: ignoring repeated ${labelChildren(childNames ?? repeated)}; only the first is rendered.`)

	if (unrelated.length)
		console.warn(`${displayName}: ignoring unrelated ${labelChildren(childNames ?? unrelated)}.`)
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
