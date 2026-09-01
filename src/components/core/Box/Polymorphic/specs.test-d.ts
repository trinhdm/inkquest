import type { InferComponentSpec } from './specs.types'

type _Equal<A, B> =
	(<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2)
		? true : false
type _Expect<T extends false> = T

type ButtonSpec = { default?: { component: 'button' }; props: { onClick?: () => void } }

// component inference resolves to the literal tag
type _T1 = _Expect<_Equal<InferComponentSpec<ButtonSpec>, 'button'>>

// // compound components must not accept className/style
// type CompoundSpec = SpecStructure<{ is: { compound: true } }>

// @ts-expect-error compound specs disallow className
const _t2: CompoundSpec['className'] = 'not-allowed'
