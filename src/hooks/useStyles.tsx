import cx from 'clsx'
import { filterProps } from './useProps'
import { useTheme, type SiteTheme } from '@/providers/ThemeProvider'
import { PREFIX_CSS_SELECTOR } from '@/utils/constants'
import type { CSSProperties } from 'react'
import type { CSSVars, DataAttrs } from '@/types/shared'
import type { ThemeCSSConfig } from '@/lib/theme'
import type { ValidSpecs } from '@/types/spec'
import { isObject } from '@/utils/helpers'
import type { RecordToMap } from '@/types/utils'

interface StyleOptions<S extends ValidSpecs<S>> {
	readonly classes?: Record<string, string>
	cssVars?: ThemeCSSConfig<S>
	name?: string
	prefix?: string
	props: S['props']
	// unstyled: boolean
}

interface SharedConfig<S extends ValidSpecs<S>>
	extends StyleOptions<S> {
	config: object | undefined
	selector: string
	theme: SiteTheme
}

type StyleConfig<S extends ValidSpecs<S>> = (
	selector: SharedConfig<S>['selector'],
	config?: SharedConfig<S>['config']
) => {
	className: string
	style: CSSProperties
}

const resolvePropClass = <S extends ValidSpecs<S>,>({
	classes,
	props,
	// selector,
	theme,
}: SharedConfig<S>) => {
	const entries = Object.entries(props),
		propClasses = [] as string[]

	if (!entries.length || (!classes || !Object.entries(classes).length)) return

	entries.forEach(([k, v]) => {
		const target = `${k}--${v}`
		if (!Object.hasOwn(classes, target)) return
		propClasses.push(classes[target])
	})

	// if (propClasses.length) {
	// 	const siteTheme = `theme--${theme}`
	// 	propClasses.unshift(classes[siteTheme])
	// }

	const className = [...new Set(propClasses)].join(' ')
	// console.log({ className })

	return className
}

const clname = (() => {
	// let opts = {} as ClassNameOptions<object>

	// const setOptions = <S extends ValidSpecs<S>,>(options: ClassNameOptions<S>) => {
	// 	if (Object.keys(opts).length) return
	// 	opts = options
	// }

	interface GetArgs<S extends ValidSpecs<S>,>
		extends Pick<SharedConfig<S>, 'classes' | 'props'>  {
		conditional?: boolean
		target: string
	}

	const get = <S extends ValidSpecs<S>,>({
		classes,
		conditional = true,
		props,
		target,
	}: GetArgs<S>): string | undefined => {
		if (!classes || !Object.hasOwn(classes, target)) return

		const isUnstyled = Object.hasOwn(props, 'unstyled')
			&& typeof props.unstyled === 'boolean'
				? props.unstyled
				: false

		return conditional && !isUnstyled ? classes[target] : undefined
	}

	interface SelectorArgs<S extends ValidSpecs<S>,>
		extends SharedConfig<S>  {
		target: string
	}

	// const selector = ({ classes, selector }) => get(classes[selector as keyof typeof classes])
	const selector = <S extends ValidSpecs<S>,>(options: SelectorArgs<S>) => {
		const { classes, name, target } = options
		const selectorClass = [] as (string | undefined)[]

		if (!!name) selectorClass.push(target)
		if (!!classes) selectorClass.push(get({ ...options, target }))

		const className = [...new Set(selectorClass)].join(' ').trim()

		return className
	}

	// const variant = ({ classes, props, selector }) => get(classes[`${selector}--${props.variant}`], props.variant)

	return {
		selector,
		// variant,
		// setOptions,
	}
})()

// Pick<ClassNameOptions, 'classes' | 'config' | 'props' | 'selector'>

const getClassName = <S extends ValidSpecs<S>,>(options: SharedConfig<S>): string => {
	// if (Object.keys(options).length) return

	const {
		// classes,
		// config,
		name,
		prefix,
		// props,
		selector,
		// theme,
	} = options

	// const { selector } = options
	// clname.setOptions(options)

	const isRoot = selector === 'root',
		baseName = `${prefix}-${name}`,
		target = isRoot
			? baseName
			: `${baseName}__${selector}`

	const settings = { ...options, isRoot, target: !!name ? target : selector }

	const selectorClass = clname.selector(settings),
		propClass = resolvePropClass(settings)

	const className = cx(selectorClass, {
		// [`${selectorClass}`]: !isRoot,
		[`${propClass}`]: isRoot,
	})

	// console.log({ propClass })

	return className
}

export type ResolvedVars = Partial<Record<string, CSSVars>>

export function mergeVars(vars: (ResolvedVars | undefined)[]) {
	return vars.reduce<ResolvedVars>((acc, current) => {
		if (current) {
			Object.keys(current).forEach((key) => {
			acc[key] = { ...acc[key], ...filterProps(current[key]!) };
			})
		}

		return acc
	}, {})
}

const getStyles = <S extends ValidSpecs<S>>({
	cssVars,
	name,
	props,
	selector,
	theme,
}: SharedConfig<S>) => {
	const themeName = (Array.isArray(name) ? name : [name]).filter((n) => n) as string[];
	// const headless = false
	const stylesCtx = {}

	const resolvedVars = mergeVars([
		// headless ? {} : cssVars?.(theme, props, stylesCtx),
		...themeName.map((n) => theme.components?.[n]?.cssVars?.(theme, props, stylesCtx)),
		cssVars?.(theme, props, stylesCtx),
	])

	const vars = Object.hasOwn(resolvedVars, selector)
		? resolvedVars[selector]
		: {}

	return { ...vars }
}

export const keyWithValue = <
	T extends Record<string, unknown>,
	K extends keyof T = keyof T,
	V = T[K]
>(entry: [K, V] | K, obj: T): boolean => {
	let key = entry as K, value
	const hasValue = Array.isArray(entry)

	if (hasValue) ([key, value] = entry)

	return Object.hasOwn(obj, key)
		&& hasValue ? obj[key] === value : !!obj[key]
}

const getDataAttrs = <S extends ValidSpecs<S>>({ props }: SharedConfig<S>) => {
	const dataAttrs: RecordToMap<DataAttrs> = new Map()
	if (!isObject(props)) return dataAttrs

	const attrsMap = {
		fullWidth: 'data-block',
		variant: 'data-variant',
	} as Record<keyof typeof props, keyof DataAttrs>

	// if (Object.hasOwn(props, prop) && props[prop] !== false)
	for (const [prop, attr] of Object.entries(attrsMap)) {
		if (keyWithValue(prop, props))
			dataAttrs.set(attr, props[prop])
	}

	// if (Object.hasOwn(props, 'variant'))
	// 	dataAttrs.set('data-variant', props['variant'])

	// if (Object.hasOwn(props, 'fullWidth'))
	// 	dataAttrs.set('data-block', true)

	return dataAttrs
}

const getHtmlAttrs = <S extends ValidSpecs<S>>({ props }: SharedConfig<S>) => {
	const attrs = new Map<string, unknown>()
	if (!isObject(props)) return attrs

	if (keyWithValue(['as', 'button'], props) && !(keyWithValue('type', props)))
		attrs.set('type', 'button')

	return attrs
}

const getAttrs = <S extends ValidSpecs<S>>(args: SharedConfig<S>) => {
	const data = getDataAttrs(args),
		html = getHtmlAttrs(args),
		attrs = new Map<string, unknown>([...data, ...html])

	return Object.fromEntries(attrs)
}

export const useStyles = <S extends ValidSpecs<S>>(opts: StyleOptions<S>): StyleConfig<S> => {
	const theme = useTheme()
	let args = { ...opts, theme } as SharedConfig<S>
	args.prefix = args['prefix'] ?? PREFIX_CSS_SELECTOR

	return (selector, config) => {
		args = { ...args, config, selector }
		const attrs = getAttrs(args)

		return {
			...attrs,
			className: getClassName(args),
			style: getStyles(args),
		}
	}
	// return Object.fromEntries((Object.entries(styles).filter(([_, value]) => !!value)))
}
