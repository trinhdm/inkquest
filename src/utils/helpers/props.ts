import cx from 'clsx'
import type { CSSProperties, ElementType } from 'react'
import type { DistributiveOmit } from '@/types/utils'
import type { SpecsContract } from '@/components/core/Box'

interface DOMStyleProps {
	className?: string
	style?: CSSProperties
}

type SpecStyleProps =
	Pick<SpecsContract, 'classNames' | 'styles'>

interface StyleAliasInput
	extends SpecStyleProps, DOMStyleProps {}

type StyleAliasResult = DOMStyleProps

type RenamedProps<T> =
	Omit<T, keyof StyleAliasInput> & StyleAliasResult

interface FilterPropsFn {
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
)) as FilterPropsFn

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

type OtherPropsList<E extends ElementType = ElementType> = {
	animated?: boolean
	as?: E
	loading?: boolean
	revealed?: boolean
}

type OtherProps<E extends ElementType = ElementType> =
	StyleAliasInput & OtherPropsList<E>

interface ExtractOtherPropsFn {
	<T extends object, A extends ElementType = ElementType>(
		rest: T & OtherProps<A>
	): {
		as: A | undefined
		others: DistributiveOmit<T, keyof StyleAliasInput | 'as'>
	}
}

export const extractOtherProps = (<
	T extends object,
	E extends ElementType
>(rest: T & OtherProps<E>) => {
	const {
		animated,
		as,
		className,
		classNames,
		loading,
		revealed,
		style,
		styles,
		...props
	} = rest

	const others = filterProps(props)

	return { as, others }
}) as ExtractOtherPropsFn
