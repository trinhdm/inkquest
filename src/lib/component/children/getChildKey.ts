import {
	isValidElement,
	type Key,
	type ReactNode,
} from 'react'

export const getChildKey = (child: ReactNode, index: number): Key =>
	isValidElement(child) && child.key !== null ? child.key : index
