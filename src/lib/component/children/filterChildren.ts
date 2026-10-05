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

interface VerifyChildrenArgs {
	children: ReactNode
	// extra?: ReactNode[]
	max?: number
	name: string
	total?: number
}

export const verifyChildren = ({
	children,
	// extra,
	max,
	name,
	total,
}: VerifyChildrenArgs) => {
	if (process.env.NODE_ENV === 'production') return

	const count = countChildren(children),
		foundText = `${name}: ${count} children found`

	if (max) {
		const maxed = max + 1
		if (count < maxed) return
		console.warn(`${foundText}; a ${name} needs less than ${maxed} children.`)
	} else if (total) {
		if (count === total) return
		console.warn(`${foundText}; a ${name} needs exactly ${total} children.`)
	}

	// if (!!extra?.length) console.warn(`${name}: ${extra?.length} extra subcomponent(s) found.`)
}

export const filterChildren = (
	children: ReactNode,
	displayName: string | string[],
	verifyArgs?: Omit<VerifyChildrenArgs, 'children'>,
): ReactNode[] => {
	const filtered: ReactNode[] = Array.isArray(displayName)
		? new Array(displayName.length).fill(null)
		: []

	Children.toArray(children).forEach(child => {
		if (isValidElement<WithChildren>(child)) {
			if (child.type === Fragment)
				return filterChildren(child.props.children, displayName)

			const { displayName: childName } = child.type as ComponentType
			if (!childName) return

			if (typeof displayName === 'string') {
				if (childName !== displayName) return
				filtered.push(child)
			} else if (Array.isArray(displayName)) {
				const i = displayName.indexOf(childName)
				if (i < 0) return
				filtered[i] = child
			}
		}
	})

	if (verifyArgs) verifyChildren({ ...verifyArgs, children: filtered })
	return filtered
}
