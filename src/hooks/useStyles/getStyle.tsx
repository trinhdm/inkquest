import { filterProps } from '../useProps'
import type { CSSVars } from '@/types/shared'
import type { SharedConfig } from './useStyles'
import type { ValidSpecs } from '@/types/spec'

type ResolvedVars = Partial<Record<string, CSSVars>>

const mergeVars = (vars: (ResolvedVars | undefined)[]) => {
	return vars.reduce<ResolvedVars>((acc, current) => {
		if (current) {
			Object.keys(current).forEach((key) => {
				acc[key] = { ...acc[key], ...filterProps(current[key]!) }
			})
		}

		return acc
	}, {})
}

export const getStyles = <S extends ValidSpecs<S>>({
	check,
	name,
	props,
	selector,
	// theme,
	tokens,
}: SharedConfig<S>) => {
	return {}
	// const themeName = (Array.isArray(name) ? name : [name]).filter((n) => n) as string[]
	// const stylesCtx = {}

	// const resolvedVars = mergeVars([
	// 	...themeName.map((n) => theme.subcomponents?.[n]?.tokens?.(theme, props, stylesCtx)),
	// 	tokens?.(theme, props, stylesCtx),
	// ])

	// console.log(tokens?.(theme, props, stylesCtx))

	// const vars = Object.hasOwn(resolvedVars, selector) && check.isRoot
	// 	? resolvedVars[selector]
	// 	: {}

	// return { ...vars }
}
