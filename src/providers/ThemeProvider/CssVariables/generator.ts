import { isObject, toKebabCase } from '@/utils/helpers'
import type { CSSVars } from '@/types/shared'
import type { SiteTheme } from '../theme.types'

const getShorthand = (tag: string, target: Record<string, any>) => {
	if (!target.hasOwnProperty('tagName')) return ''

	const { tagName } = target
	if (!tagName.hasOwnProperty(tag)) return ''

	const props = tagName[tag]
	let shorthand = []

	if (Object.hasOwn(target, 'fontWeight'))
		shorthand.push(target['fontWeight'])
	else if (Object.hasOwn(props, 'fontWeight'))
		shorthand.push(props['fontWeight'])

	if (Object.hasOwn(props, 'fontSize')) {
		let temp = props['fontSize']

		if (Object.hasOwn(props, 'lineHeight'))
			temp += `/${props['lineHeight']}`

		shorthand.push(temp)
	}

	if (Object.hasOwn(target, 'fontFamily'))
		shorthand.push(target['fontFamily'])

	return shorthand.join(' ')
}

const formatVariable = <V,>({ key, path = '', value }: {
	key: string
	path: string
	value: V
}) => {
	let name = toKebabCase(key)

	const isPlural = name.endsWith('s') && name.length > 2,
		isTagGroup = isObject(value) && Object.hasOwn(value, 'tagName'),
		isNumeric = typeof value === 'number'
			|| /\d/.test(`${value}`)
			|| (isObject(value) && Object.values(value).every(v => /\d/.test(`${v}`)))

	if (name.startsWith('font')) {
		const replaced = {
			'font-family': '-family',
			'font-weight': 'font-',
		}[name]

		if (replaced)
			name = name.replace(replaced, '')
	}

	if (isPlural && (isTagGroup || isNumeric))
		name = name.slice(0, -1)

	const variable = !!path ? `${path}-${name}` : name

	return variable
}

export const toCssVars = <T extends Record<string, any>>(
	input: T,
	prefix: string = ''
) => {
	const generate = <T extends Record<string, any> = SiteTheme>(target: T, path = '') => {
		let variables = [] as [string, unknown][]

		for (let key in target) {
			const value = target[key]
			let vname = formatVariable({ key, path, value })

			if (typeof value === 'function') continue

			if (isObject(value)) {
				if (Object.hasOwn(value, 'tagName')) {
					const tags = Object.keys(value['tagName'])

					for (const tag of tags) {
						vname = formatVariable({ key: `text-${tag}`, path, value })
						variables.push([`--${vname}`, getShorthand(tag, value)])
					}
				} else {
					variables = variables.concat(generate(value, vname))
				}
			} else {
				variables.push([`--${vname}`, value])
			}
		}

		return variables
	}

	const entries = generate(input, prefix)
	return Object.fromEntries(entries)
}

export const themeToCssVars = (
	theme: SiteTheme,
	prefix: string = ''
) => {
	const darkTheme = {
		themeName: 'dark',
	}

	const lightTheme = {
		themeName: 'light',
	}

	const general = toCssVars(theme, prefix),
		dark = toCssVars(darkTheme, prefix),
		light = toCssVars(lightTheme, prefix)

	const cssVars = { general, dark, light }

	return cssVars
}
