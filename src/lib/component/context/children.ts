import {
	isValidElement,
	Children,
	Fragment,
	type ComponentType,
	type Key,
	type ReactNode,
} from 'react'

interface WithChildren {
	children?: ReactNode
}

export const getChildKey = (child: ReactNode, index: number): Key =>
	isValidElement(child) && child.key !== null ? child.key : index

export const filterChildren = (
	children: ReactNode,
	displayName: string | string[]
): ReactNode[] => (
	Children.toArray(children).flatMap<ReactNode>(child => {
		if (isValidElement<WithChildren>(child)) {
			if (child.type === Fragment)
				return filterChildren(child.props.children, displayName)

			const childName = (child.type as ComponentType).displayName

			if (!childName)
				return []
			else if (typeof displayName === 'string')
				if (childName !== displayName) return []
			else if (Array.isArray(displayName))
				if (!displayName.includes(childName)) return []
		}

		return [child]
	})
)

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

export const verifyChildren = ({
	children,
	// extras,
	name,
	total = 1,
}: {
	children: ReactNode
	// extras?: ReactNode[]
	name: string
	total?: number
}) => {
	if (process.env.NODE_ENV === 'production') return
	const count = countChildren(children)

	if (count === total) return
	console.warn(`${name}: ${count} children found; a ${name} needs exactly ${total} children.`)

	// if (!!extras?.length)
	// 	console.warn(`${name}: ${extras?.length} extra subcomponent(s) found.`)
}

export const extractChildrenText = (children: ReactNode): string => {
	let text = ''

	Children.toArray(children).forEach(child => {
		if (typeof child === 'string' || typeof child === 'number')
			text += `${child}`
		else if (isValidElement<WithChildren>(child) && 'children' in child.props)
			text += extractChildrenText(child.props?.children as ReactNode)
	})

	return text.trim()
}
