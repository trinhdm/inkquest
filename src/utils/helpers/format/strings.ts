export const capitalize = (value: string) =>
	value[0].toUpperCase() + value.slice(1)

export const toKebabCase = (str: string) =>
	str.replace(/\.(?=[A-Z])/g, '')
		.replace(/[A-Z]/g, (char, i) => (i > 0 ? `-${char}` : char))	// for compound names
		.toLowerCase()

export const toSlug = (str: string) =>
	str.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
