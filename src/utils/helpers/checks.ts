
export const hasValue = <V,>(
	value: V
): boolean => {
	if (value === null || value === undefined)
		return false
	if (typeof value === 'string')
		return value.trim().length > 0
	if (Array.isArray(value))
		return value.length > 0
	if (value instanceof Map || value instanceof Set)
		return value.size > 0
	if (typeof value === 'object')
		return value?.constructor === Object && Object.keys(value).length > 0
	return true
}

