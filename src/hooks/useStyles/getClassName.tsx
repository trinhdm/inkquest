import cx from 'clsx'
import { toKebabCase } from '@/utils/helpers'
import type { SharedConfig } from './useStyles'
import type { ValidSpecs } from '@/types/spec'

const getBaseClass = <S extends ValidSpecs<S>>({
	check,
	name,
	prefix,
	selector,
}: SharedConfig<S>): string | undefined => {
	if (check.isUnstyled) return
	let baseName = toKebabCase(name)

	if (prefix) baseName = `${prefix}-${baseName}`
	if (!check.isRoot) baseName += `__${selector}`

	return baseName
}

export const getClassName = <S extends ValidSpecs<S>>(
	options: SharedConfig<S>
): string => {
	const { classes } = options,
		baseClass = getBaseClass(options)

	if (!baseClass) return ''

	const classList = [baseClass],
		styleClass = classes?.[baseClass]

	if (styleClass) classList.push(styleClass)

	return cx(...classList)
}
