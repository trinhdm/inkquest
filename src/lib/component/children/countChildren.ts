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
): number =>
	Children.toArray(children).reduce<number>((count, child) => {
		if (!isValidElement<WithChildren>(child))
			return displayName ? count : count + 1
		if (child.type === Fragment)
			return count + countChildren(child.props.children, displayName)
		if (!displayName || displayName === (child.type as ComponentType).displayName)
			return count + 1
		return count
	}, 0)
