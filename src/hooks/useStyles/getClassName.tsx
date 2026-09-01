import cx from 'clsx'
import { toKebabCase } from '@/utils/helpers'
import type { SharedConfig } from './useStyles'

const getBaseClass = <P,>({
	check,
	name,
	prefix,
	selector,
}: SharedConfig<P>): string => {
	let baseName = toKebabCase(name)

	if (prefix) baseName = `${prefix}-${baseName}`
	if (!check.isRoot) baseName += `__${selector}`

	return baseName
}

export const getClassName = <P,>(
	config: SharedConfig<P>
): string => {
	const { check, classes } = config,
		baseClass = getBaseClass(config)

	const classList = [baseClass],
		styleClass = classes?.[baseClass]

	if (styleClass && !check.isUnstyled)
		classList.push(styleClass)

	return cx(...classList)
}
