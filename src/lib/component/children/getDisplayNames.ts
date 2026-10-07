import {
	isValidElement, Children, Fragment,
	type ComponentType, type ReactNode,
} from 'react'

import { WithChildren } from './types'

export const getDisplayNames = (children: ReactNode) =>
	Children.toArray(children).map(child => {
		if (!isValidElement<WithChildren>(child) || child.type === Fragment) return
		return (child.type as ComponentType).displayName
	})
