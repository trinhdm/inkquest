import { keyHasValue } from '@/utils/helpers'
import type { CSSProperties } from 'react'
import type { SharedConfig } from './useStyles'
import type { RootCtxValue, SpecsContract } from '@/lib/component'

type InheritConfig<S extends SpecsContract> =
	Omit<SharedConfig<S>, 'props'>
	& { props: S['props'] & Record<'style', CSSProperties> }

const canInherit = <S extends SpecsContract>(
	args: SharedConfig<S>
): args is InheritConfig<S> =>
	'style' in args.props && keyHasValue(args.props, 'style')

const inheritStyles = <S extends SpecsContract>({
	check,
	props,
}: InheritConfig<S>): CSSProperties => (
	check.isRoot && keyHasValue(props, 'style')
		? props.style
		: {}
)

export const getStyle = <S extends SpecsContract>(
	args: SharedConfig<S>
): CSSProperties => {
	const inherited = canInherit(args)
		? inheritStyles(args)
		: {}

	const {
		context,
		props,
		selector,
		theme,
		tokens,
	} = args

	if (typeof tokens === 'function') {
		const variables = tokens({
			context: context as RootCtxValue<S['context']>,
			props,
			theme,
		})

		if (keyHasValue(variables, selector)) {
			const styles = variables[selector]
			if (typeof styles === 'object' && !!styles)
				return { ...inherited, ...styles }
		}
	}

	return inherited
}
