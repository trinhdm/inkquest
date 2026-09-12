import { keyHasValue } from '@/utils/helpers'
import type { CSSProperties } from 'react'
import type { SharedConfig } from './useStyles'

export const getStyle = <P extends object, V extends object>({
	props,
	selector,
	theme,
	tokens,
}: SharedConfig<P, V>): CSSProperties => {
	if (typeof tokens !== 'function') return {}

	const stylesCtx = {}
	const variables = tokens?.(theme, props, stylesCtx)

	if (keyHasValue(variables, selector)) {
		const styles = variables[selector]
		if (typeof styles === 'object' && !!styles)
			return styles
	}

	return {}
}
