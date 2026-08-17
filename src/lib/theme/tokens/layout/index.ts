import { getElementTokens, type ElementTokens } from './element'
import { getPaddingTokens, type PaddingTokens } from './padding'
import { getSpaceTokens, type SpaceTokens } from './space'

interface LayoutTokens {
	element: () => ElementTokens
	padding: () => PaddingTokens
	space: () => SpaceTokens
}

export const getLayoutTokens: LayoutTokens = {
	element: getElementTokens,
	padding: getPaddingTokens,
	space: getSpaceTokens,
}

export type { ElementTokens } from './element'
export type { PaddingTokens } from './padding'
export type { SpaceTokens } from './space'
