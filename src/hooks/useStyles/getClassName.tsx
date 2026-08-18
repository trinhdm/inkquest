import cx from 'clsx'
import type { SharedConfig } from './useStyles'
import type { ValidSpecs } from '@/types/spec'

const getBaseClass = <S extends ValidSpecs<S>>(
	{ name, prefix, selector }: SharedConfig<S>
) => {
	if (!name) return
	let baseName = name

	if (prefix) baseName = `${prefix}-${baseName}`
	if (selector !== 'root') baseName += `__${selector}`

	return baseName
}

export const getClassName = <S extends ValidSpecs<S>>(
	options: SharedConfig<S>
): string => {
	const { check, classes } = options
	if (check.isUnstyled) return ''

	const baseClass = getBaseClass(options)
	if (!baseClass) return ''

	return cx(baseClass, classes?.[baseClass])
}
