import cx from 'clsx'
import type { CSSProperties, ElementType, ReactNode } from 'react'
import type { DistributiveOmit } from '@/types/utils'
import type { SpecsContract } from '@/components/polymorphic'

interface DOMStyleProps {
	className?: string
	style?: CSSProperties
}

type SpecStyleProps =
	Pick<SpecsContract, 'classNames' | 'styles'>

interface StyleAliasInput
	extends SpecStyleProps, DOMStyleProps {}

type RenamedProps<T> =
	Omit<T, keyof StyleAliasInput> & DOMStyleProps

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
): DOMStyleProps => {
	const className = cx(_props.className, _props.classNames)
	const style = { ..._props.style, ..._props.styles }

	const result: DOMStyleProps = {}
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

type OtherPropsList<E extends ElementType> = {
	as?: E
	childName?: string
	children?: ReactNode
	displayName?: string
	loading?: boolean
	once?: boolean
	revealFrom?: number
	withinView?: boolean
}

type OtherProps<E extends ElementType> =
	StyleAliasInput & OtherPropsList<E>

type ExtractOtherPropNames =
	| 'as'
	| 'children'
	| 'withinView'

type OtherExtractedProps<E extends ElementType> =
	Pick<OtherPropsList<E>, ExtractOtherPropNames>

function extractOthers<T extends object, E extends ElementType = ElementType>(
	rest: T & OtherProps<E>
): OtherExtractedProps<E> & {
	others: DistributiveOmit<T, keyof OtherProps<E>>
}
function extractOthers(rest: OtherProps<ElementType>) {
	const {
		as,
		childName,
		children,
		className,
		classNames,
		displayName,
		loading,
		once,
		revealFrom,
		style,
		styles,
		withinView,
		...props
	} = rest

	const others = filterProps(props)

	return {
		as,
		others,
		withinView,
	}
}

interface ExtractOtherPropsFn {
	<T extends object, E extends ElementType = ElementType>(
		rest: T & OtherProps<E>
	): OtherExtractedProps<E> & {
		others: DistributiveOmit<T, keyof OtherProps<E>>
	}
}

export const extractOtherProps: ExtractOtherPropsFn = extractOthers
