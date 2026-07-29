import type { AsType } from './types'
import type { ComponentSpec, FactorySpec } from './factory'
import type { ClassValue } from 'clsx'
import type { CSSProperties } from 'react'

type _CompoundSpec<S extends ComponentSpec> = NonNullable<S['is']>['compound']

type _RootSpec<
	K,
	V,
	S extends ComponentSpec,
	C = FactorySpec<S>,
> = _CompoundSpec<S> extends true
	? never
	: K extends keyof C
		? C[K] extends V | undefined
			? C[K]
			: never
		: never

type _Attributes<S extends ComponentSpec> = _RootSpec<'attributes', Record<string, unknown>, S>
type _ClassNames<S extends ComponentSpec> = _RootSpec<'classNames', ClassValue, S>
type _Styles<S extends ComponentSpec> = _RootSpec<'styles', CSSProperties, S>

type _ID<S extends ComponentSpec> = AsType<S['id'], string>
type _Variant<S extends ComponentSpec> = AsType<S['variant'], string>

export interface Structure<S extends ComponentSpec = ComponentSpec> {
	attributes?: _Attributes<S>
	classNames?: _ClassNames<S>
	id?: _ID<S>
	styles?: _Styles<S>
	variant?: _Variant<S>
}
