import { hasValue, toKebabCase } from '@/utils/helpers'

type PrefixedAttributes<T extends Record<string, any>, S extends string> = {
	[K in keyof T as `${S}-${string & K}`]?: T[K]
}

const toAttributeName = (key: string) => {
	let attribute = key,
		parts = [] as string[],
		prefix = ''

	if (key.startsWith('aria-') || key.startsWith('data-')) {
		([prefix, ...parts] = key.split('-'))
		attribute = parts.join('-')
		parts = [prefix]
	}

	attribute = toKebabCase(attribute)
	parts.push(attribute)

	return parts.join('-')
}

export const prefixAttributes = <T extends Record<string, any>, S extends string>(
	attributes: T | undefined,
	prefix: S
): PrefixedAttributes<T, S> => {
	if (!attributes) return {}
	const attrs = Object.entries(attributes)

	return attrs.reduce<PrefixedAttributes<T, S>>((acc, [key, value]) => {
		const k = toAttributeName(`${prefix}-${key}`) as keyof PrefixedAttributes<T, S>
		if (hasValue(value)) acc[k] = value
		return acc
	}, {} as PrefixedAttributes<T, S>)
}
