import { keyHasValue } from '@/utils/helpers'
import type { CSSProperties } from 'react'
import type { SharedConfig } from './useStyles'

type InheritConfig<P extends object, V extends object> =
	Omit<SharedConfig<P, V>, 'props'>
	& { props: P & Record<'style', CSSProperties> }

const canInherit = <P extends object, V extends object>(
	args: SharedConfig<P, V>
): args is InheritConfig<P, V> =>
	'style' in args.props && keyHasValue(args.props, 'style')

const inheritStyles = <P extends object, V extends object>({
	check,
	props,
}: InheritConfig<P, V>): CSSProperties => (
	check.isRoot && keyHasValue(props, 'style')
		? props.style
		: {}
)

export const getStyle = <P extends object, V extends object>(
	args: SharedConfig<P, V>
): CSSProperties => {
	const inherited = canInherit(args)
		? inheritStyles(args)
		: {}

	const {
		props,
		selector,
		theme,
		tokens,
	} = args

	if (typeof tokens === 'function') {
		const stylesCtx = {}
		const variables = tokens?.(theme, props, stylesCtx)

		if (keyHasValue(variables, selector)) {
			const styles = variables[selector]
			if (typeof styles === 'object' && !!styles)
				return { ...inherited, ...styles }
		}
	}

	return inherited
}
