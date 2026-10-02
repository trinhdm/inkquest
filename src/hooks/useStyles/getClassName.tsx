import cx, { type ClassValue } from 'clsx'
import { isObject, toKebabCase } from '@/utils/helpers'
import type { SharedConfig } from './useStyles'
import type { SpecsContract } from '@/lib/component/factory/types'

const getBaseClass = <S extends SpecsContract>(
	name: SharedConfig<S>['name'],
	prefix: SharedConfig<S>['prefix'],
): string => {
	let baseName = toKebabCase(name)

	if (prefix && !baseName.startsWith(prefix))
		baseName = `${prefix}-${baseName}`

	return baseName
}

const nameClassBase = <S extends SpecsContract>({
	check,
	name,
	prefix,
	selector,
}: SharedConfig<S>): string => {
	let classBase = getBaseClass(name, prefix)

	if (!check.isRoot)
		classBase += `__${selector}`

	return classBase
}

const getStyleClass = <S extends SpecsContract>(
	baseName: string,
	args: SharedConfig<S>
): string | undefined => {
	const { check, classes } = args
	if (check.isUnstyled || !classes || !Object.hasOwn(classes, baseName)) return
	return classes[baseName]
}

type SelectorConfig<S extends SpecsContract> =
	Omit<SharedConfig<S>, 'config'>
	& { config: Extract<SharedConfig<S>['config'], object> }

const formatConfigClass = <S extends SpecsContract>(
	modifier: NonNullable<Exclude<ClassValue, object>>,
	key: keyof SelectorConfig<S>['config'],
	args: SelectorConfig<S>
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

const getConfigClass = <S extends SpecsContract>(
	key: keyof SelectorConfig<S>['config'],
	args: SelectorConfig<S>
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

const hasConfig = <S extends SpecsContract>(
	args: SharedConfig<S>
): args is SelectorConfig<S> =>
	!!args.config && isObject(args.config)

const getConfigClasses = <S extends SpecsContract>(
	args: SharedConfig<S>
): string | undefined => {
	const { config, prefix, selector } = args

	if (typeof config === 'boolean' && config) return getBaseClass(selector, prefix)
	else if (!hasConfig(args)) return

	const classList = [],
		keys = Object.keys(args.config) as (keyof typeof config)[]

	for (const key of keys) {
		const configClasses = getConfigClass(key, args)
		classList.push(configClasses)
	}

	return cx(...classList)
}

type InheritConfig<S extends SpecsContract> =
	Omit<SharedConfig<S>, 'props'>
	& { props: S['props'] & Record<'className', string> }

const canInherit = <S extends SpecsContract>(
	args: SharedConfig<S>
): args is InheritConfig<S> =>
	'className' in args.props && typeof args.props.className === 'string'

const inheritClasses = <S extends SpecsContract>({
	check,
	name,
	prefix,
	props,
	selector,
}: InheritConfig<S>): string[] => {
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

	const semanticOf = (cn: string) => {
		if (!prefix) return ''
		if (cn.startsWith(`${prefix}-`)) return cn

		const index = cn.lastIndexOf(`__${prefix}-`)
		return index > -1 ? cn.slice(index + 2) : ''
	}

	const isPrefixed = (cn: string) => !!semanticOf(cn)
	const isExtendable = (cn: string) => isPrefixed(cn) && !semanticOf(cn).includes('--')

	return classList
		.filter(cn => check.isRoot
			? (!check.isUnstyled || isPrefixed(cn))
        	: isExtendable(cn)
		)
		.map(cn => {
			const root = suffix && cn.endsWith(suffix)
				? `${cn.slice(0, -suffix.length)}${element}`
				: cn

			return check.isRoot ? root : `${root}__${selector}`
		})
}

export const getClassName = <S extends SpecsContract>(
	args: SharedConfig<S>
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
