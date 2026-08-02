
export type DataAttrs = Record<`data-${string}`, unknown>

export type CSSVariable = `--${string}`
export type CSSVars<V = unknown> = Record<CSSVariable, V>

export type HexCode = `#${string}`
