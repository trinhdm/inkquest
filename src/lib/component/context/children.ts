import {
	isValidElement, Children, Fragment,
	type ComponentType, type Key, type ReactNode,
} from 'react'

export const getChildKey = (child: ReactNode, index: number): Key =>
	isValidElement(child) && child.key !== null ? child.key : index

export const filterChildren = (
	children: ReactNode,
	displayName: string | string[]
): ReactNode[] => (
	Children.toArray(children).flatMap<ReactNode>(child => {
		if (isValidElement<{ children?: ReactNode }>(child)) {
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

export const extractChildrenText = (children: ReactNode): string => {
	let text = ''

	Children.toArray(children).forEach(child => {
		if (typeof child === 'string' || typeof child === 'number')
			text += `${child}`
		else if (isValidElement<{ children?: ReactNode }>(child) && 'children' in child.props)
			text += extractChildrenText(child.props?.children as ReactNode)
	})

	return text.trim()
}
