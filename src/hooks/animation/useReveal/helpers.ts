export const REVEAL_INVIEW = .15
export const REVEAL_DATAKEYS = {
	root: {
		active: 'data-revealed',
		base: 'data-js-reveal',
	},
	child: 'data-reveal-item',
} as const

export interface RevealRootProps {
	[REVEAL_DATAKEYS.root.base]?: ''
	[REVEAL_DATAKEYS.root.active]?: ''
}

export interface RevealItemProps {
	[REVEAL_DATAKEYS.child]?: `${number}`
}

// indices are handed out in the order the caller builds its slots, never read
// back from the DOM — heterogeneous slots are partitioned before they render,
// so the caller is the only thing that knows the final order
export interface RevealCounter {
	/** consumes one index and returns the attribute bag for a slot */
	next: () => RevealItemProps
	/** reserves `total` indices and returns the first; `undefined` when not animated */
	reserve: (total: number) => number | undefined
}

// the index travels as the attribute's value — `extractOtherProps` strips
// `style` off components, but an unrecognised `data-*` prop reaches the DOM
export const revealItem = (
	index: number,
	target = REVEAL_DATAKEYS.child,
): RevealItemProps =>
	({ [target]: `${index}` })

// the receiving half of `RevealCounter.reserve()`: the child at `index` within a
// range reserved from `from`. `from` is `undefined` when the parent isn't
// animated, and is checked with `typeof` rather than truthiness because a
// reserved range can legitimately start at 0
export const revealItemFrom = (
	index: number,
	from?: number,
): RevealItemProps =>
	typeof from === 'number' ? revealItem(from + index) : {}
