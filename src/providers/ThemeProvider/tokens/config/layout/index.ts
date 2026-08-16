import { getElementTokens, type ElementTokens } from './element'
import { getSpaceTokens, type SpaceTokens } from './space'

interface LayoutTokens {
	element: () => ElementTokens
	space: () => SpaceTokens
}

export const getLayoutTokens: LayoutTokens = {
	element: getElementTokens,
	space: getSpaceTokens,
}

export type { ElementTokens } from './element'
export type { SpaceTokens } from './space'
