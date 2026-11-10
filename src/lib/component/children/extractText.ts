import { isValidElement, Children, type ReactNode } from 'react'
import type { WithChildren } from './types'

export const extractText = (children: ReactNode): string => {
	let text = ''

	Children.toArray(children).forEach(child => {
		if (typeof child === 'string' || typeof child === 'number')
			text += `${child}`
		else if (isValidElement<WithChildren>(child) && 'children' in child.props)
			text += extractText(child.props?.children as ReactNode)
	})

	return text.trim()
}
