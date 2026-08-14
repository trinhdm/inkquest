import { isObject } from '@/utils/helpers'

interface ShorthandArgs<T> {
	property: keyof typeof _SHORTHANDLERS
	tag: string
	value?: T
}

const readStyle = (
	key: string,
	...sources: Record<string, unknown>[]
): string | undefined => {
	for (const source of sources)
		if (Object.hasOwn(source, key)) return String(source[key])

	return undefined
}

const fontShorthand = <T extends Record<string, unknown>>(props: T[]) => {
	// const properties = Object.keys(Object.assign({}, ...props))
	// if (!properties.some(k => k.includes('font'))) return ''

	const family = readStyle('fontFamily', ...props),
		fontSize = readStyle('fontSize', ...props),
		lineHeight = readStyle('lineHeight', ...props),
		weight = readStyle('fontWeight', ...props)

	let size = fontSize

	if (size && lineHeight)
		size += `/${lineHeight}`

	return [weight, size, family].filter(part => part !== undefined).join(' ')
}

const _SHORTHANDLERS = {
	font: fontShorthand
}

export const getShorthand = <T extends Record<string, unknown>>({
	property, tag, value,
}: ShorthandArgs<T>): string | undefined => {
	if (!Object.hasOwn(_SHORTHANDLERS, property)) return
	if (!value || !Object.hasOwn(value, 'tagName')) return
	const { tagName } = value

	if (!isObject(tagName) || !Object.hasOwn(tagName, tag)) return
	const tagProps = tagName[tag] as T

	if (isObject(tagProps) && !Object.keys(tagProps).some(k => k.includes(property)))  return

	return (_SHORTHANDLERS[property])([value, tagProps])
}
