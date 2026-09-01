import cx from 'clsx'
import type { ClassValue } from 'clsx'
import type { CSSProperties } from 'react'

type StyleableProps = {
	classNames?: unknown
	styles?: unknown
}

type RenamedProps<T extends StyleableProps> = Omit<T, 'classNames' | 'styles'> & {
	className?: T['classNames']
	style?: T['styles']
}

type FilteredProps<T extends object> = {
	[K in keyof T]: T[K] extends undefined
		? never : T[K]
}

export const filterProps = <T extends object>(
	props: T,
	omitEmpty = false
): FilteredProps<T> => (
	(Object.keys(props) as (keyof T)[]).reduce<FilteredProps<T>>((acc, key) => {
		const value = props[key] as FilteredProps<T>[typeof key]
		let isValid = Object.hasOwn(props, key)

		if (omitEmpty) isValid = isValid && !!value
		if (isValid) acc[key] = value

		return acc
	}, {} as FilteredProps<T>)
)

/** The four style-related prop names this module reconciles. */
export interface StyleAliasInput {
	className?: ClassValue
	classNames?: ClassValue
	style?: CSSProperties
	styles?: CSSProperties
}

/** `className`/`style`, normalized, with empty results omitted entirely. */
export interface StyleAliasResult {
	className?: string
	style?: CSSProperties
}

const mergeStyleAliases = <T extends object & StyleAliasInput>(
	_props: T
): StyleAliasResult => {
	const className = cx(_props.className, _props.classNames)
	const style = { ..._props.style, ..._props.styles }

	const result: StyleAliasResult = {}
	if (className) result.className = className
	if (Object.keys(style).length) result.style = style

	return result
}

export const styleProps = <T extends object>(
	_props: T
): FilteredProps<RenamedProps<T>> => {
	const hasAliases =
		Object.hasOwn(_props, 'classNames') || Object.hasOwn(_props, 'styles')
		|| Object.hasOwn(_props, 'className') || Object.hasOwn(_props, 'style')

	if (!hasAliases) return filterProps(_props)

	const { className, classNames, style, styles, ...rest } = _props as T & StyleAliasInput
	const aliases = mergeStyleAliases(_props)

	const aliasedProps = { ...rest, ...aliases } as RenamedProps<T>
	return filterProps(aliasedProps)
}
