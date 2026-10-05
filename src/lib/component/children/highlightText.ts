import {
	cloneElement,
	createElement,
	isValidElement,
	Children,
	type ReactNode,
} from 'react'

import type { WithChildren } from './types'

const ESCAPE_REGEX = /[.*+?^${}()|[\]\\]/g
const escapeTerm = (term: string): string => term.replace(ESCAPE_REGEX, '\\$&')

// Rebuilds `children` with every case-insensitive occurrence of any `terms`
// entry wrapped in a `<mark>`, leaving the rest of the tree as it was — the
// counterpart to `extractText`, which reads text OUT of a tree.
// `<mark>` is styled globally (`src/styles/_base.scss`), so no class is passed.
// Kept as `.ts` (not renamed `.tsx`) by using `createElement` instead of JSX.
export const highlightText = (children: ReactNode, terms: string[]): ReactNode => {
	// a blank term is a zero-width alternative that matches between every
	// character, and ONE blank entry poisons the whole alternation —
	// `'abc'.split(/(|b)/gi)` is `['a', '', 'b', '', 'c']`
	const needles = terms.filter(Boolean)
	if (!needles.length) return children

	// a single capturing group means `String.split` returns the matched
	// delimiters interleaved with the text between them — odd indices are
	// always a match, so no separate (stateful, `g`-flag) `regex.test` is
	// needed. Compiled once per call, not once per node.
	const pattern = new RegExp(`(${needles.map(escapeTerm).join('|')})`, 'gi')

	const markText = (text: string): ReactNode => {
		const parts = text.split(pattern)

		// one part means no hit anywhere — hand back the original string
		// rather than a one-item array, so untouched text stays a text node
		if (parts.length === 1) return text

		return parts.map((part, index) => (
			index % 2 === 1
				? createElement('mark', { key: `${index}-${part}` }, part)
				: part
		))
	}

	const walk = (node: ReactNode): ReactNode => {
		if (typeof node === 'string') return markText(node)

		// numbers render verbatim; booleans, null and undefined render
		// nothing. Neither is text this can split.
		if (typeof node !== 'object' || node === null) return node

		// a Fragment needs no branch of its own, unlike in `filterChildren`
		// (which has to flatten one to reach a `displayName`) — here it is
		// just an element whose only prop is `children`
		if (isValidElement<WithChildren>(node))
			return 'children' in node.props
				? cloneElement(node, undefined, walk(node.props.children))
				: node

		// anything else object-shaped — a portal, a `Promise<ReactNode>` — is
		// handed back untouched: `Children.toArray` THROWS on a thenable (the
		// promise itself, React's suspense path) and on a plain object, and a
		// highlighter has no business triggering either
		if (!(Symbol.iterator in node)) return node

		// `Children.toArray` flattens nested arrays, drops the nodes that
		// render nothing, and keys every surviving element — so the clones
		// above arrive pre-keyed and React has nothing to warn about
		return Children.toArray(node).map(walk)
	}

	return walk(children)
}
