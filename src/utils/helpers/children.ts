import {
	isValidElement, Children, Fragment,
	type ComponentType, type ReactNode,
} from 'react'

export const flattenChildren = (children: ReactNode, displayName: string): ReactNode[] => (
	Children.toArray(children).flatMap<ReactNode>(child => {
		if (isValidElement<{ children?: ReactNode }>(child)) {
			if (child.type === Fragment)
				return flattenChildren(child.props.children, displayName)
			if ((child.type as ComponentType).displayName !== displayName)
				return []
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
