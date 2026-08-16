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
	cssVars,
	name,
	props,
	selector,
	theme,
}: SharedConfig<S>) => {
	const themeName = (Array.isArray(name) ? name : [name]).filter((n) => n) as string[]
	const stylesCtx = {}

	const resolvedVars = mergeVars([
		...themeName.map((n) => theme.subcomponents?.[n]?.cssVars?.(theme, props, stylesCtx)),
		cssVars?.(theme, props, stylesCtx),
	])

	// console.log(cssVars?.(theme, props, stylesCtx))

	const vars = Object.hasOwn(resolvedVars, selector) && selector === 'root'
		? resolvedVars[selector]
		: {}

	return { ...vars }
}
