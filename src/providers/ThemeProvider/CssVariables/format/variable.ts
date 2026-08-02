import { _is } from './checks'
import { toKebabCase } from '@/utils/helpers'
import type { BaseVarKey } from '../../theme.types'

export interface CSSVarArgs<T> {
	path: string[]
	prefix?: string
	value: T
}

const FONT_PART_INDEX = {
	'family': 1,
	'weight': 0,
} as const

const formatFontName = (name: string) => {
	const parts = name.split('-'),
		index = FONT_PART_INDEX[parts[1] as keyof typeof FONT_PART_INDEX]
	return typeof index === 'number'
		? parts.toSpliced(index, 1).join('-')
		: name
}

const formatName = <T,>({ path, value }: CSSVarArgs<T>) => {
	let name = toKebabCase(path[0])

	if (_is.FontName(name))
		name = formatFontName(name)

	if (_is.Plural(name) && _is.Singular(value))
		name = name.slice(0, -1)

	if (_is.Verb(name))
		name = name.replace('ing', 'e')

	return name
}

const formatPath = <T,>({ path }: CSSVarArgs<T>) => {
	let route = path

	if (route.at(-1) === ('base' as BaseVarKey))
		route = route.slice(0, -1)

	for (const [i, str] of route.entries())
		route[i] = toKebabCase(str)

	return route
}

export const getVariable = <T,>(args: CSSVarArgs<T>): string => {
	const { path, prefix } = args
	if (!path.length) return ''

	const name = formatName(args),
		route = formatPath(args)

	const segments = [name, ...route.slice(1)]
	if (prefix) segments.unshift(prefix)

	return `--${segments.join('-')}`
}
