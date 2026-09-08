import cx from 'clsx'
import { toKebabCase } from '@/utils/helpers'
import type { SharedConfig } from './useStyles'

type Inheritable = Record<'className', string>

type InheritConfig<P extends object, V extends object> =
	Omit<SharedConfig<P, V>, 'props'> & { props: P & Inheritable }

const canInherit = <P extends object, V extends object>(
	args: SharedConfig<P, V>
): args is InheritConfig<P, V> =>
	'className' in args.props && typeof args.props.className === 'string'

const getBaseClass = <P extends object, V extends object>({
	check,
	name,
	prefix,
	selector,
}: SharedConfig<P, V>): string => {
	let baseName = toKebabCase(name)

	if (prefix && !baseName.startsWith(prefix))
		baseName = `${prefix}-${baseName}`

	if (!check.isRoot)
		baseName += `__${selector}`

	return baseName
}

const formatClass = <P extends object, V extends object>(
	args: SharedConfig<P, V>
): string => {
	const { check, classes } = args,
		baseClass = getBaseClass(args),
		classList = [baseClass]

	if (!check.isUnstyled) {
		if (classes && Object.hasOwn(classes, baseClass))
			classList.push(classes[baseClass])
	}

	return cx(...classList)
}



const inheritClasses = <P extends object, V extends object>({
	check,
	name,
	prefix,
	props,
	selector,
}: InheritConfig<P, V>): string[] => {
	const { className } = props,
		classList = className.split(/\s+/).filter(Boolean)

	if (check.isUnstyled || !classList.length) return []

	const [semantic] = classList,
		index = semantic.indexOf('__')

	let suffix = '',
		element = ''

	if (index > -1) {
		suffix = `__${semantic.slice(index + 2)}`
		element = `__${toKebabCase(name)}`
	}

	return classList
		// keeps plain
		// .filter(cn => !check.isUnstyled || (!!prefix && cn.startsWith(prefix)))
		.filter(cn => !prefix || !cn.startsWith(prefix))
		.map(cn => {
			const root = suffix && cn.endsWith(suffix)
				? `${cn.slice(0, -suffix.length)}${element}`
				: cn

			return check.isRoot ? root : `${root}__${selector}`
		})
}

export const getClassName = <P extends object, V extends object>(
	args: SharedConfig<P, V>
): string => {
	const classList = [formatClass(args)]

	if (canInherit(args))
		classList.push(...inheritClasses(args))

	return cx(...classList)
}
