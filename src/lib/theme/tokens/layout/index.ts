import { getBreakpointTokens, getContainerTokens, getGridTokens, type BreakpointTokens, type ContainerTokens, type GridTokens } from './grid'
import { getElementTokens, type ElementTokens } from './element'
import { getPaddingTokens, type PaddingTokens } from './padding'
import { getSpaceTokens, type SpaceTokens } from './space'

export interface LayoutTokens {
	breakpoint: () => BreakpointTokens
	container: () => ContainerTokens
	element: () => ElementTokens
	grid: () => GridTokens
	padding: () => PaddingTokens
	space: () => SpaceTokens
}

export const getLayoutTokens: LayoutTokens = {
	breakpoint: getBreakpointTokens,
	container: getContainerTokens,
	element: getElementTokens,
	grid: getGridTokens,
	padding: getPaddingTokens,
	space: getSpaceTokens,
}

export type { BreakpointTokens, ContainerTokens } from './grid'
export type { ElementTokens } from './element'
export type { PaddingTokens } from './padding'
export type { SpaceTokens } from './space'
