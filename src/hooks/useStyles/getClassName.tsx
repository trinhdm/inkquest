import cx from 'clsx'
import { toKebabCase } from '@/utils/helpers'
import type { SharedConfig } from './useStyles'

const getBaseClass = <P extends object, V extends object>({
	check,
	name,
	prefix,
	selector,
}: SharedConfig<P, V>): string => {
	let baseName = toKebabCase(name)

	if (prefix) baseName = `${prefix}-${baseName}`
	if (!check.isRoot) baseName += `__${selector}`

	return baseName
}

export const getClassName = <P extends object, V extends object>(
	args: SharedConfig<P, V>
): string => {
	const { check, classes, props } = args,
		baseClass = getBaseClass(args)

	const classList = [baseClass],
		styleClass = classes?.[baseClass]

	if (styleClass && !check.isUnstyled)
		classList.push(styleClass)

	if ('className' in props && typeof props.className === 'string')
		classList.push(props.className)

	return cx(...classList)
}
