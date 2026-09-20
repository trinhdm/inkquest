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

	return attrs.reduce<PrefixedAttributes<T, S>>((acc, [k, v]) => {
		if (hasValue(v)) {
			const key = toAttributeName(`${prefix}-${k}`) as keyof PrefixedAttributes<T, S>,
				value = prefix.includes('data') && typeof v === 'boolean' && v ? '' : v
			acc[key] = value
		}

		return acc
	}, {} as PrefixedAttributes<T, S>)
}
