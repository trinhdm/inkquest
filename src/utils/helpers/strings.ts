
export const toKebabCase = (str: string) =>
	str.replace(/[A-Z]/g, (match, index) => {
		const char = match.toLowerCase()
		return index > 0 ? `-${char}` : char
	}).toLowerCase()
