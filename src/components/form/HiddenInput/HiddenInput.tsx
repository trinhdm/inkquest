import { extractOthers } from '@/hooks/useProps'
import { polymorphic } from '@/lib/component/factory'
import { Box } from '@/components/polymorphic/Box'
import type { Field } from '../Field'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import classes from './HiddenInput.module.scss'

const NAME = 'HiddenInput' as const,
	TAG = 'input' as const

const DEFAULT_PROPS = {
	as: TAG,
} as const

interface HiddenInputProps {
	id?: string
	name: string
	value: string
}

interface HiddenInputSpecs {
	context: Field.Context
	defaults: {
		as: typeof TAG
		props: PropsDefaultList<typeof DEFAULT_PROPS>
	}
	props: HiddenInputProps
	selectors: HiddenInputSelectors
}

type HiddenInputSelectors =
	| 'root' | 'icon'
	| 'toggle' | 'glyph'

export const HiddenInput = polymorphic<HiddenInputSpecs>((_props, { useProps, useStyles }) => {
	const props = useProps(_props)
	const styles = useStyles({ props })

	const {
		id, name, value,
		...rest
	} = props

	const others = extractOthers(rest)

	return (
		<Box
			{ ...styles('root') }
			{ ...others }
			as={ TAG }
			id={ id }
			name={ name }
			type="hidden"
			value={ value }
		/>
	)
}, { name: NAME, classes })

HiddenInput.set({
	defaultProps: DEFAULT_PROPS,
	displayName: NAME,
})

export declare namespace HiddenInput {
	export type Props = HiddenInputProps
	export type Specs = HiddenInputSpecs
}
