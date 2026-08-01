
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

const formatCssVars = <V,>({ path, prefix, value }: {
	path: string[]
	prefix?: string
	value: V
}): string => {
	let name, variable = ''
	if (!path.length) return variable

	name = toKebabCase(path[0])

	if (name.startsWith('font')) {
		const substr = {
			'font-family': '-family',
			'font-weight': 'font-',
		}[name]

		if (substr)
			name = name.replace(substr, '')
	}

	if (name.endsWith('s') && name.length > 2) {
		const isTagGroup = isObject(value) && Object.hasOwn(value, 'tagName'),
			isNumeric = typeof value === 'number'
				|| /\d/.test(`${value}`)
				|| (isObject(value) && Object.values(value).every(v => /\d/.test(`${v}`)))

		if (isTagGroup || isNumeric)
			name = name.slice(0, -1)
	}

	const parts = [] as string[]
	variable = '--'

	path[0] = name

	if (prefix) parts.push(prefix)
	parts.push(...path)

	variable += parts.join('-')

	return variable
}

const generateCssVars = <T extends Record<string, any>>(
	input: T,
	prefix: string = ''
) => {
	const vars: Record<string, string> = {}

	const generate = (value: T, path: string[]) => {
		if (typeof value === 'function') return
		if (value === undefined) return

		const args = { path, prefix, value }
		let name = formatCssVars(args)

		if (isObject(value)) {
			if (!Object.hasOwn(value, 'tagName')) {
				Object.entries(value).forEach(([k, v]) => generate(v, [...path, k]))
				return
			}

			const tags = Object.keys(value['tagName'])
			for (const tag of tags) {
				name = formatCssVars({ ...args, path: ['text', tag] })
				vars[name] = getShorthand(tag, value)
			}

			return
		}

		vars[name] = String(value)
	}

	generate(input, [])
	return vars as CSSVars
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

	const general = generateCssVars(theme, prefix),
		dark = generateCssVars(darkTheme, prefix),
		light = generateCssVars(lightTheme, prefix)

	const cssVars = { general, dark, light }

	return cssVars
}
