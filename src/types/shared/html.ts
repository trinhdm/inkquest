import type { AriaAttributes, ComponentPropsWithoutRef, ElementType } from 'react'

// type Aria = `aria-${string}`
export type DataAttrs = Record<`data-${string}`, unknown>

export type CSSVariable = `--${string}`
export type CSSVars<V = unknown> = Record<CSSVariable, V>

export type HexCode = `#${string}`


export type ExtractHtmlAttributes<T extends ElementType> =
	Omit<
		ComponentPropsWithoutRef<T>,
		keyof AriaAttributes
	>


type RemoveAriaPrefix<T> = {
	[K in keyof T as K extends `aria-${infer Rest}` ? Rest : never]: T[K]
}

type AriaName =
	RemoveAriaPrefix<AriaAttributes>

export interface SpecAttributes {
	aria?: AriaName
	data?: Record<string, unknown>
}
