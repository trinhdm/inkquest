import { isObject, toKebabCase } from '@/utils/helpers'

const readStyle = (
	key: string,
	...sources: Record<string, unknown>[]
): string | undefined => {
	for (const source of sources)
		if (Object.hasOwn(source, key)) return String(source[key])

	return undefined
}

const fontShorthand = <T extends Record<string, unknown>>(props: T[]) => {
	const family = readStyle('fontFamily', ...props),
		fontSize = readStyle('fontSize', ...props),
		lineHeight = readStyle('lineHeight', ...props),
		weight = readStyle('fontWeight', ...props)

	let size = fontSize

	if (size && lineHeight)
		size += `/${lineHeight}`

	return [weight, size, family].filter(part => part !== undefined).join(' ')
}

const _shorthandlers = {
	font: fontShorthand
}

export const getShorthand = <T extends Record<string, unknown>>({ property, tag, value }: {
	property: keyof typeof _shorthandlers
	tag: string
	value: T
}) => {
	if (!Object.hasOwn(_shorthandlers, property)) return ''
	if (!Object.hasOwn(value, 'tagName')) return ''

	const { tagName } = value
	if (!isObject(tagName) || !Object.hasOwn(tagName, tag)) return ''

	const tagProps = tagName[tag] as T,
		props = [value, tagProps]

	return (_shorthandlers[property])(props)
}

export const getVariable = <V,>({ path, prefix, value }: {
	path: string[]
	prefix?: string
	value: V
}): string => {
	if (!path.length) return ''
	let name = toKebabCase(path[0])

	if (name.startsWith('font') && name.includes('-')) {
		const parts = name.split('-')
		const index = {
			'family': 1,
			'weight': 0,
		}[parts[1]]

		if (typeof index === 'number')
			name = parts.toSpliced(index, 1).join('-')
	}

	if (name.endsWith('s') && name.length > 2) {
		const isTagGroup = isObject(value) && Object.hasOwn(value, 'tagName'),
			isNumeric = typeof value === 'number'
				|| /\d/.test(`${value}`)
				|| (isObject(value) && Object.values(value).every(v => /\d/.test(`${v}`)))

		if (isTagGroup || isNumeric)
			name = name.slice(0, -1)
	}

	const namedPath = [name, ...path.slice(1)],
		segments = [] as string[]

	if (prefix) segments.push(prefix)
	segments.push(...namedPath)

	return `--${segments.join('-')}`
}
