import cx, { type ClassValue } from 'clsx'
import { isObject, toKebabCase } from '@/utils/helpers'
import type { SharedConfig } from './useStyles'

const getBaseClass = <P extends object, V extends object>(
	name: SharedConfig<P, V>['name'],
	prefix: SharedConfig<P, V>['prefix'],
): string => {
	let baseName = toKebabCase(name)

	if (prefix && !baseName.startsWith(prefix))
		baseName = `${prefix}-${baseName}`

	return baseName
}

const nameClassBase = <P extends object, V extends object>({
	check,
	name,
	prefix,
	selector,
}: SharedConfig<P, V>): string => {
	let classBase = getBaseClass(name, prefix)

	if (!check.isRoot)
		classBase += `__${selector}`

	return classBase
}

const getStyleClass = <P extends object, V extends object>(
	baseName: string,
	args: SharedConfig<P, V>
): string | undefined => {
	const { check, classes } = args
	if (check.isUnstyled || !classes || !Object.hasOwn(classes, baseName)) return
	return classes[baseName]
}

type SelectorConfig<P extends object, V extends object> =
	Omit<SharedConfig<P, V>, 'config'> & {
		config: Extract<SharedConfig<P, V>['config'], object>
	}

const formatConfigClass = <P extends object, V extends object>(
	modifier: NonNullable<Exclude<ClassValue, object>>,
	key: keyof SelectorConfig<P, V>['config'],
	args: SelectorConfig<P, V>
): string | undefined => {
	const { name, prefix } = args,
		mod = `${modifier}`

	const targets = {
		global: mod,
		module: `${name}--${mod}`,
		selector: `${nameClassBase(args)}--${mod}`,
	}

	const target = targets[key],
		baseName = getBaseClass(target, prefix),
		styleName = getStyleClass(baseName, args)

	return styleName ?? baseName
}

const getConfigClassList = <P extends object, V extends object>(
	key: keyof SelectorConfig<P, V>['config'],
	args: SelectorConfig<P, V>
): string | undefined => {
	const { config } = args

	if (!Object.hasOwn(config, key) || !config[key]) return

	const classList = [],
		values = config[key]

	if (Array.isArray(values)) {
		for (const value of values) {
			const className = formatConfigClass(value, key, args)
			classList.push(className)
		}

		return cx(...classList)
	} else if (typeof values === 'object') {
		const validClasses = Object.entries(values).filter(([_, v]) => !!v).map(([k]) => k)

		for (const validName of validClasses) {
			const className = formatConfigClass(validName, key, args)
			classList.push(className)
		}

		return cx(...classList)
	}

	return formatConfigClass(values, key, args)
}

const hasConfig = <P extends object, V extends object>(
	args: SharedConfig<P, V>
): args is SelectorConfig<P, V> =>
	!!args.config && isObject(args.config)

const getConfigClasses = <P extends object, V extends object>(
	args: SharedConfig<P, V>
): string | undefined => {

	const { config, prefix, selector } = args

	if (typeof config === 'boolean')
		return getBaseClass(selector, prefix)

	else if (!hasConfig(args)) return

	const classList = [],
		keys = Object.keys(args.config) as (keyof typeof config)[]

	for (const key of keys) {
		const configClasses = getConfigClassList(key, args)
		classList.push(configClasses)
	}

	return cx(...classList)
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
	const baseName = nameClassBase(args),
		styleName = getStyleClass(baseName, args),
		configNames = getConfigClasses(args)

	const inherited = canInherit(args) ? inheritClasses(args) : [],
		[namespace, ...modules] = inherited

	const classList = [
		namespace ?? baseName,
		styleName,
		configNames,
	]

	return cx(...classList, ...modules)
}
