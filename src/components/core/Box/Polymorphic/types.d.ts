
export type DataAttrs = Record<`data-${string}`, any>
export type TagName = keyof HTMLElementTagNameMap

export type InferSpecDefault<S> = S extends {
	default: { component: infer K }
} ? K : any

export type ValueOf<
	S,
	K = InferSpecDefault<S>,
	D = 'default' extends keyof S ? S['default'] : {}
> = K extends keyof D
	? D[K]
	: K extends keyof S
		? S[K]
		: never
