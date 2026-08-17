import { _is } from './checks'
import { toKebabCase } from '@/utils/helpers'
import type { BaseVarKey } from '../types'
import type { CSSVars } from '@/types/shared'

export interface CSSVarArgs<T> {
	path: string[]
	prefix?: string
	value?: T
}

// const FONT_PART_INDEX = {
// 	family: 1,
// 	// size: 0,
// 	weight: 0,
// } as const

// const formatFontName = (name: string) => {
// 	const parts = name.split('-'),
// 		index = FONT_PART_INDEX[parts[1] as keyof typeof FONT_PART_INDEX]
// 	return typeof index === 'number'
// 		? parts.toSpliced(index, 1).join('-')
// 		: name
// }

const formatName = <T,>({ path }: CSSVarArgs<T>): string => {
	let name = toKebabCase(path[0])

	// if (_is.FontName(name))
	// 	name = formatFontName(name)

	// if (_is.Plural(name))
	// 	name = name.slice(0, -1)

	// if (_is.Verb(name))
	// 	name = name.replace('ing', 'e')

	return name
}

const formatRoute = <T,>({ path }: CSSVarArgs<T>): CSSVarArgs<T>['path'] => {
	if (!path?.length) return path
	let route = path

	route = route.flatMap(str => {
		let part = toKebabCase(str)

		if (part.includes('.')) {
			const step = parseFloat(part)
			if (typeof step === 'number' && step < 100)
				part = `${step * 100}`
		}

		if (route.length > 2 && part.includes('-'))
			return [...part.split('-')]

		return part
	})

	if (route.length !== path.length) {
		const unique = new Set(route)
		route = [...unique]
	}

	if (route.at(-1) === ('base' as BaseVarKey))
		route = route.slice(0, -1)

	return route
}

export const formatToken = <T,>(args: CSSVarArgs<T>): keyof CSSVars => {
	const name = formatName(args),
		route = formatRoute(args)

	const segments = [name, ...route.slice(1)]
	const { prefix } = args

	if (prefix && !name.startsWith(`--${prefix}`))
		segments.unshift(prefix)

	let token = segments.join('-')
	token = token.replace(/^[- ]*/, '--')

	return `${token as keyof CSSVars}` as const
}
