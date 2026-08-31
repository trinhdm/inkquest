import cx from 'clsx'
import { toKebabCase } from '@/utils/helpers'
import type { SharedConfig } from './useStyles'
import type { ValidSpecs } from '@/types/spec'

const getBaseClass = <S extends ValidSpecs<S>>({
	check,
	name,
	prefix,
	selector,
}: SharedConfig<S>): string => {
	let baseName = toKebabCase(name)

	if (prefix) baseName = `${prefix}-${baseName}`
	if (!check.isRoot) baseName += `__${selector}`

	return baseName
}

export const getClassName = <S extends ValidSpecs<S>>(
	config: SharedConfig<S>
): string => {
	const { check, classes } = config,
		baseClass = getBaseClass(config)

	const classList = [baseClass],
		styleClass = classes?.[baseClass]

	if (styleClass && !check.isUnstyled)
		classList.push(styleClass)

	return cx(...classList)
}
