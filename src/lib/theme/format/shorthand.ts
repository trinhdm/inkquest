interface ShorthandArgs<T> {
	property: keyof typeof _SHORTHANDLERS
	values: T[]
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
	property, values,
}: ShorthandArgs<T>): string | undefined => {
	if (!Object.hasOwn(_SHORTHANDLERS, property)) return

	return (_SHORTHANDLERS[property])(values)
}
