import { keyHasValue } from '@/utils/helpers'
import type { SharedConfig } from './useStyles'

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

export const getStyles = <P extends object, V extends object>({
	name,
	props,
	selector,
	theme,
	tokens,
}: SharedConfig<P, V>) => {
	if (typeof tokens !== 'function') return {}

	// const themeName = (Array.isArray(name) ? name : [name]).filter((n) => n) as string[]
	const stylesCtx = {}

	// const resolvedVars = mergeVars([
	// 	...themeName.map((n) => theme.subcomponents?.[n]?.tokens?.(theme, props, stylesCtx)),
	// 	tokens?.(theme, props, stylesCtx),
	// ])

	const variables = tokens?.(theme, props, stylesCtx)

	if (keyHasValue(variables, selector)) {
		const styles = variables[selector]
		if (typeof styles === 'object' && !!styles)
			return styles
	}

	return {}

	// return Object.hasOwn(variables, selector)
	// 	? variables[selector]
	// 	: {}
}
