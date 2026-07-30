import cx from 'clsx'
import { useTheme, type SiteTheme } from '@/providers/ThemeProvider'
import type { CSSProperties } from 'react'
import type { ValidSpecs } from '@/types/spec'

interface ClassNameOptions {
	readonly classes: Record<string, string>
	config: object | undefined
	props: Record<string, unknown>
	selector: string
	theme: SiteTheme
	unstyled: boolean
}

interface StyleOptions<S extends ValidSpecs<S>> {
	readonly classes?: Record<string, string>
	props: S['props']
}

type StyleConfig<S extends ValidSpecs<S>> = (
	selector: string,
	config?: object
) => {
	className: string
	style: CSSProperties
}

const resolvePropClass = ({
	classes,
	props,
	// selector,
	theme,
}: ClassNameOptions) => {
	const entries = Object.entries(props),
		propClasses = [] as string[]

	if (!entries.length || !Object.entries(classes).length) return

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
	let opts = {} as ClassNameOptions

	const setOptions = (options: ClassNameOptions) => {
		if (Object.keys(opts).length) return
		opts = options
	}

	const get = (value: string, conditional: boolean = true): string | undefined => {
		if (!Object.keys(opts).length) return

		return conditional && !opts.unstyled ? value : undefined
	}

	const selector = ({ classes, selector }) => get(classes[selector as keyof typeof classes])
	const variant = ({ classes, props, selector }) => get(classes[`${selector}--${props.variant}`], props.variant)

	return {
		selector,
		variant,
		setOptions,
	}
})()

// Pick<ClassNameOptions, 'classes' | 'config' | 'props' | 'selector'>

const getClassName = (options: ClassNameOptions): string => {
	// if (Object.keys(options).length) return

	const {
		classes,
		config,
		props,
		selector,
		theme,
		unstyled,
	} = options

	clname.setOptions(options)
	const propClasses = resolvePropClass(options)

	return cx(
		clname.selector({ classes, selector }),
		clname.variant({ classes, props, selector }),
		propClasses
	)
}

export const useStyles = <S extends ValidSpecs<S>>({
	classes,
	props
}: StyleOptions<S>): StyleConfig<S> => {
	const theme = useTheme()

	return (selector, config) => ({
		className: getClassName({ classes, config, props, selector, theme }),
		style: {},
	})
}
