import cx from 'clsx'
import { toKebabCase } from '@/utils/helpers'
import type { SharedConfig } from './useStyles'

const formatClass = <P extends object, V extends object>(
	name: SharedConfig<P, V>['name'],
	prefix: SharedConfig<P, V>['prefix'],
): string => {
	let baseName = toKebabCase(name)

	if (prefix && !baseName.startsWith(prefix))
		baseName = `${prefix}-${baseName}`

	return baseName
}

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

const getStyleClass = <P extends object, V extends object>(
	args: SharedConfig<P, V>
): string | undefined => {
	const { check, classes } = args

	if (check.isUnstyled) return

	const baseClass = getBaseClass(args)

	if (classes && Object.hasOwn(classes, baseClass))
		return classes[baseClass]
}

const getGlobalClass = <P extends object, V extends object>({
	config,
	prefix,
}: SharedConfig<P, V>): string | undefined => {
	if (!config || typeof config.global !== 'string') return
	return formatClass(config.global, prefix)
}

type Inheritable = Record<'className', string>

type InheritConfig<P extends object, V extends object> =
	Omit<SharedConfig<P, V>, 'props'> & { props: P & Inheritable }

const canInherit = <P extends object, V extends object>(
	args: SharedConfig<P, V>
): args is InheritConfig<P, V> =>
	'className' in args.props && typeof args.props.className === 'string'

const inheritClasses = <P extends object, V extends object>({
	check,
	name,
	prefix,
	props,
	selector,
}: InheritConfig<P, V>): string[] => {
	const { className } = props,
		classList = className.split(/\s+/).filter(Boolean)

	if (!classList.length) return []

	const [semantic] = classList,
		index = semantic.indexOf('__'),
		slot = index > -1 ? semantic.slice(index + 2) : '',
		self = toKebabCase(name)

	let suffix = '',
		element = ''

	// Extend the inherited slot only when this component is a named sub-part of it
	// (`menu` -> `menu-item`); an unrelated component keeps the parent's slot name.
	if (slot && self.startsWith(slot)) {
		suffix = `__${slot}`
		element = `__${self}`
	}

	return classList
		.filter(cn => !check.isUnstyled || (!!prefix && cn.startsWith(prefix)))
		// .filter(cn => !!prefix && cn.startsWith(prefix))
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
	const inherited = canInherit(args) ? inheritClasses(args) : [],
		[namespace, ...modules] = inherited,
		classList = [
			getGlobalClass(args),
			namespace ?? getBaseClass(args),
			getStyleClass(args),
		]

	return cx(...classList, ...modules)
}
