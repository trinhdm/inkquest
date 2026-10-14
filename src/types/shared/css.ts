import type { CSSProperties } from 'react'

//	css

export type CSSVariable = `--${string}`
export type CSSVars<V = unknown> = Record<CSSVariable, V>

export type HexCode = `#${string}`

type CSSJustify =
	| 'normal' | 'start' | 'center' | 'end'
	| 'space-around' | 'space-between' | 'space-evenly'

export type JustifyContent =
	Extract<CSSProperties['justifyContent'], CSSJustify>
