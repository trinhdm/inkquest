import {
	createElement,
	isValidElement,
	Children,
	type ElementType,
	type ReactNode,
} from 'react'

//	tag names that may legally sit inside a `<p>`
const INLINE_TAGS = new Set([
	'a', 'abbr', 'b', 'bdi', 'bdo', 'br', 'cite',
	'code', 'data', 'dfn', 'em', 'i', 'kbd', 'mark',
	'q', 's', 'samp', 'small', 'span', 'strong',
	'sub', 'sup', 'time', 'u', 'var', 'wbr',
])

const isInlineNode = (node: ReactNode): boolean => (
	typeof node === 'string'
		|| typeof node === 'number'
		|| (isValidElement(node) && typeof node.type === 'string' && INLINE_TAGS.has(node.type))
)

export const withInlineWrap = (children: ReactNode, tag: ElementType = 'p') => {
	const items = Children.toArray(children),
		isInline = !!items.length && items.every(isInlineNode)
	return isInline ? createElement(tag, {}, children) : children
}
