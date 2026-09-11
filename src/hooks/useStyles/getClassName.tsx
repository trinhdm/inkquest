import cx from 'clsx'
import { toKebabCase } from '@/utils/helpers'
import type { SharedConfig } from './useStyles'

const formatClass = <P extends object, V extends object>(
	name: SharedConfig<P, V>['name'],
	prefix: SharedConfig<P, V>['prefix'],
): string => {
	let className = toKebabCase(name)

	if (prefix && !className.startsWith(prefix))
		className = `${prefix}-${className}`

	return className
}

const getBaseClass = <P extends object, V extends object>({
	check,
	name,
	prefix,
	selector,
}: SharedConfig<P, V>): string => {
	let baseName = formatClass(name, prefix)

	if (!check.isRoot)
		baseName += `__${selector}`

	return baseName
}

const getStyleClass = <P extends object, V extends object>(
	baseName: string,
	args: SharedConfig<P, V>
): string | undefined => {
	const { check, classes } = args
	if (check.isUnstyled || !classes || !Object.hasOwn(classes, baseName)) return
	return classes[baseName]
}

const getConfigClasses = <P extends object, V extends object>(
	args: SharedConfig<P, V>
): string | undefined => {
	const { config, prefix, selector } = args

	if (typeof config === 'boolean')
		return formatClass(`${selector}`, prefix)

	else if (!config || !Object.hasOwn(config, 'clsx') || !config.clsx) return

	const { clsx } = config

	if (Array.isArray(clsx)) {
		return cx(...clsx)
	} else if (typeof clsx === 'object') {
		const classList = [],
			validClasses = Object.entries(clsx).filter(([_, v]) => v === true).map(([k]) => k)

		for (const className of validClasses) {
			const baseName = formatClass(className, prefix),
				target = getStyleClass(baseName, args)

			classList.push(target ?? baseName)
		}

		return cx(...classList)
	}

	const baseName = formatClass(`${clsx}`, prefix),
		target = getStyleClass(baseName, args)

	return target ?? baseName
}

type InheritConfig<P extends object, V extends object> =
	Omit<SharedConfig<P, V>, 'props'> & { props: P & Record<'className', string> }

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

	const isExtendable = (cn: string) =>
		!!prefix && cn.startsWith(prefix) && !cn.includes('--')

	return classList
		.filter(cn => check.isRoot
			? (!check.isUnstyled || (!!prefix && cn.startsWith(prefix)))
			: isExtendable(cn)
		)
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
	const baseName = getBaseClass(args),
		styleClass = getStyleClass(baseName, args),
		inherited = canInherit(args) ? inheritClasses(args) : []

	const [namespace, ...modules] = inherited,
		classList = [
			namespace ?? baseName,
			styleClass,
			getConfigClasses(args),
		]

	return cx(...classList, ...modules)
}
