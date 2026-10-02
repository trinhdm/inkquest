import cx from 'clsx'
import type { CSSProperties, ElementType, ReactNode } from 'react'
import type { DistributiveOmit } from '@/types/utils'
import type { ReplayAnimateInViewConfig } from '../animation'

interface DOMStyleProps {
	className?: string
	style?: CSSProperties
}

type SpecStyleProps = {
	classNames?: string
	styles?: CSSProperties
}

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

type OtherPropsList<E extends ElementType = ElementType> = {
	as?: E
	childName?: string
	children?: ReactNode
	displayName?: string
	loading?: boolean
}

type OtherProps<E extends ElementType = ElementType> =
	StyleAliasInput
	& ReplayAnimateInViewConfig
	& OtherPropsList<E>

const RESERVED_PROPS = [
	'amount',
	'animated',
	'as',
	'childName',
	'children',
	'className',
	'classNames',
	'displayName',
	'delay',
	'duration',
	'index',
	'initial',
	'lead',
	'loading',
	'margin',
	'once',
	'revealFrom',
	'root',
	'stagger',
	'style',
	'styles',
	'withinView',
] as const satisfies readonly (keyof OtherProps)[]

const RESERVED = new Set<string>(RESERVED_PROPS)

export type ReservedProp =
	typeof RESERVED_PROPS[number]

export type ExtractedOtherProps<T, K extends ReservedProp = never> =
	DistributiveOmit<T, Exclude<ReservedProp, K>>

//	`keep` is the escape hatch for a component that forwards `others`
//	to another component rather than to the DOM — i.e. `StatisticGroup`
export const extractOtherProps = <
	T extends object,
	E extends ElementType = ElementType,
	K extends ReservedProp = never,
>(rest: T & OtherProps<E>, keep?: readonly K[]): ExtractedOtherProps<T, K> => {
	const kept = keep?.length ? new Set<string>(keep) : undefined
	const props = Object.fromEntries(
		Object.entries(rest).filter(([key]) => !RESERVED.has(key) || !!kept?.has(key))
	) as ExtractedOtherProps<T, K>

	return filterProps(props)
}
