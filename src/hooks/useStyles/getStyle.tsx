// import { filterProps } from '@/utils/helpers'
// import type { CSSVars } from '@/types/shared'
import type { SharedConfig } from './useStyles'
import type { ValidSpecs } from '@/types/spec'
import { useVariantStyles } from '../useVariantStyles'
// import type { ThemeCSSConfig } from '@/lib/theme'

// type ResolvedVars = Partial<Record<string, CSSVars>>

// const mergeVars = (vars: (ResolvedVars | undefined)[]) => {
// 	return vars.reduce<ResolvedVars>((acc, current) => {
// 		if (current) {
// 			Object.keys(current).forEach((key) => {
// 				acc[key] = { ...acc[key], ...filterProps(current[key]!) }
// 			})
// 		}

// 		return acc
// 	}, {})
// }

export const getStyles = <S extends ValidSpecs<S>>({
	check,
	name,
	props,
	selector,
	theme,
	tokens,
}: SharedConfig<S>) => {
	// return {}
	if (typeof tokens !== 'function') return {}

	// const themeName = (Array.isArray(name) ? name : [name]).filter((n) => n) as string[]
	const stylesCtx = {}

	// const resolvedVars = mergeVars([
	// 	...themeName.map((n) => theme.subcomponents?.[n]?.tokens?.(theme, props, stylesCtx)),
	// 	tokens?.(theme, props, stylesCtx),
	// ])

	const variables = tokens?.(theme, props, stylesCtx)

	if (Object.hasOwn(variables, 'stylesheet')) {
		const styles = variables['stylesheet']
		if (typeof styles === 'string')
			useVariantStyles(name, styles)
	}

	if (Object.hasOwn(variables, selector)) {
		const styles = variables[selector]
		if (typeof styles === 'object') return styles
	}

	return {}

	// return Object.hasOwn(variables, selector)
	// 	? variables[selector]
	// 	: {}
}
