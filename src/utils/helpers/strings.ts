
export const toKebabCase = (str: string) =>
	str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
