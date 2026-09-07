import cx from 'clsx'
import type { CSSProperties, ElementType } from 'react'
import type { SpecsContract } from '@/components/core/Box/Polymorphic/specs.types'

interface DOMStyleProps {
	className?: string
	style?: CSSProperties
}

type SpecStyleProps =
	Pick<SpecsContract, 'classNames' | 'styles'>

export interface StyleAliasInput
	extends SpecStyleProps, DOMStyleProps {}

export type StyleAliasResult = DOMStyleProps

type RenamedProps<T> =
	Omit<T, keyof StyleAliasInput> & StyleAliasResult

interface FilterProps {
	<T extends object>(props: T): T
	<T extends object>(props: T, omitEmpty: boolean): Partial<T>
}

export const filterProps = (<T extends object>(
	props: T,
	omitEmpty = false
) => (
	(Object.keys(props) as (keyof T)[]).reduce<Partial<T>>((acc, key) => {
		const value = props[key]
		let isValid = Object.hasOwn(props, key)
		if (omitEmpty) isValid = isValid && !!value
		if (isValid) acc[key] = value
		return acc
	}, {})
)) as FilterProps

const mergeStyleAliases = <T extends StyleAliasInput>(
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
): RenamedProps<T> => {
	const hasAliases =
		Object.hasOwn(_props, 'classNames') || Object.hasOwn(_props, 'styles')
		|| Object.hasOwn(_props, 'className') || Object.hasOwn(_props, 'style')

	if (!hasAliases) return filterProps(_props)

	const { className, classNames, style, styles, ...rest } = _props as T & StyleAliasInput
	const aliases = mergeStyleAliases(_props)

	const aliasedProps = { ...rest, ...aliases }
	return filterProps(aliasedProps)
}
