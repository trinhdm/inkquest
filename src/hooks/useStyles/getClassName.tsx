import cx from 'clsx'
import type { SharedConfig } from './useStyles'
import type { ValidSpecs } from '@/types/spec'

const getBaseClass = <S extends ValidSpecs<S>>(
	{ name, prefix, selector }: SharedConfig<S>
) => {
	if (!name) return
	let baseName = name
	// let baseName = toKebabCase(name).slice(1)

	if (prefix) baseName = `${prefix}-${baseName}`
	if (selector !== 'root') baseName += `__${selector}`

	return baseName
}

const resolvePropClass = <S extends ValidSpecs<S>>(
	{ classes, props }: SharedConfig<S>
) => {
	if (!classes) return
	const classList = new Set<string>(),
		entries = Object.entries(props)

	entries.forEach(([k, v]) => classList.add(classes[`${k}--${v}`]))

	return cx([...classList])
}

const resolveSelectorClass = <S extends ValidSpecs<S>,>(
	options: SharedConfig<S>,
	baseClass?: string
) => {
	if (!baseClass) return
	const { classes } = options,
		classList = new Set<string>([baseClass])

	if (!!classes) classList.add(classes[baseClass])

	return cx([...classList])
}

export const getClassName = <S extends ValidSpecs<S>>(options: SharedConfig<S>): string => {
	const { check } = options

	const baseClass = getBaseClass(options),
		propClass = resolvePropClass(options),
		selectorClass = resolveSelectorClass(options, baseClass)

	if (check.isUnstyled) return cx(baseClass)

	const className = cx(selectorClass, {
		[`${propClass}`]: check.isRoot,
	})

	return className
}



// const resolvePropClass = <S extends ValidSpecs<S>>({
// 	classes,
// 	props,
// }: SharedConfig<S>) => {
// 	const entries = Object.entries(props),
// 		propClasses = [] as string[]

// 	if (!entries.length || (!classes || !Object.entries(classes).length)) return

// 	entries.forEach(([k, v]) => {
// 		const target = `${k}--${v}`
// 		if (!Object.hasOwn(classes, target)) return
// 		propClasses.push(classes[target])
// 	})

// 	const className = [...new Set(propClasses)].join(' ')

// 	return className
// }

// const nameSelector = <S extends ValidSpecs<S>,>(
// 	options: SharedConfig<S>,
// 	target?: string
// ) => {
// 	const { classes, name, props } = options
// 	const isUnstyled = keyWithValue(['unstyled', true], props) ? props.unstyled : false,
// 		selectorClass = [] as (string | undefined)[]

// 	if (!!name) selectorClass.push(target)
// 	if (!!classes && !isUnstyled) selectorClass.push(classes[target])

// 	const className = [...new Set(selectorClass)].join(' ').trim()

// 	return className
// }

// const clname = (() => {
// 	interface GetArgs<S extends ValidSpecs<S>>
// 		extends Pick<SharedConfig<S>, 'classes' | 'props'>  {
// 		conditional?: boolean
// 		target: string
// 	}

// 	const get = <S extends ValidSpecs<S>,>({
// 		classes,
// 		conditional = true,
// 		props,
// 		target,
// 	}: GetArgs<S>): string | undefined => {
// 		if (!classes || !Object.hasOwn(classes, target)) return

// 		const isUnstyled = Object.hasOwn(props, 'unstyled')
// 			&& typeof props.unstyled === 'boolean'
// 				? props.unstyled
// 				: false

// 		return conditional && !isUnstyled ? classes[target] : undefined
// 	}

// 	interface SelectorArgs<S extends ValidSpecs<S>>
// 		extends SharedConfig<S>  {
// 		target: string
// 	}

// 	// const selector = ({ classes, selector }) => get(classes[selector as keyof typeof classes])
// 	const selector = <S extends ValidSpecs<S>,>(options: SelectorArgs<S>) => {
// 		const { classes, name, target } = options
// 		const selectorClass = [] as (string | undefined)[]

// 		if (!!name) selectorClass.push(target)
// 		if (!!classes) selectorClass.push(get({ ...options, target }))

// 		const className = [...new Set(selectorClass)].join(' ').trim()

// 		return className
// 	}

// 	return {
// 		selector,
// 	}
// })()
