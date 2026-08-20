
export const capitalize = (value: string) =>
	value[0].toUpperCase() + value.slice(1)

export const toKebabCase = (str: string) =>
	str.replace(/[A-Z]/g,
		(char, index) => (index > 0 ? `-${char}` : char)
	).toLowerCase()
