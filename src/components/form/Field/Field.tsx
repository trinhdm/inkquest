import { useId, useMemo, type ReactNode } from 'react'
import { LoaderCircle } from 'lucide-react'
import { extractOthers } from '@/hooks/useProps'
import { filterChildren, polymorphic, verifyChildren } from '@/lib/component'
import { toKebabCase } from '@/utils/helpers'
import { Box } from '@/components/polymorphic/Box'
import { FieldProvider, type FieldContext } from './Field.context'
import { TextInput } from '../TextInput'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import type { Size } from '@/types/shared'
import classes from './Field.module.scss'

const NAME = 'Field' as const,
	TAG = 'div' as const

const DEFAULT_PROPS = {
	as: TAG,
	required: false,
} as const

const SUBCOMPONENTS = {
	// FileUpload: FileUpload,
	// TextArea: TextArea,
	Input: TextInput,
} as const

interface FieldProps {
	children: ReactNode
	disabled?: boolean
	error?: string
	id: string
	label?: string
	loading?: boolean
	required?: boolean
	size?: Size
}

interface FieldSpecs {
	defaults: {
		as: typeof TAG
		props: PropsDefaultList<typeof DEFAULT_PROPS>
	}
	props: FieldProps
	selectors: FieldSelectors
	subcomponents: typeof SUBCOMPONENTS
}

type FieldSelectors =
	| 'root' | 'label' | 'control'
	| 'required' | 'indicator' | 'error'

const buildField = (children: FieldProps['children']) => {
	const childNames = [TextInput.displayName]
	const [field] = filterChildren(children, childNames)

	verifyChildren({ children, name: NAME, total: 1 })

	if (!field) return null
	return <>{ field }</>
}

export const Field = polymorphic<FieldSpecs>((_props, { useProps, useStyles }) => {
	const props = useProps(_props)
	const styles = useStyles({ props })

	const {
		as,
		children,
		disabled,
		error,
		id,
		label,
		loading,
		required,
		size,
		unstyled,
		...rest
	} = props

	const others = extractOthers(rest)
	const hasError = !!error?.trim()

	const uid = useId()
	const idx = useMemo(() => {
		const root = toKebabCase(id ?? uid),
			control = `${root}-control`,
			error = `${root}-error`
		return { control, error }
	}, [id, uid])

	const ctxValues = useMemo(() => ({
		disabled, loading, required,
		hasError, idx, size, unstyled,
	}), [
		disabled, loading, required,
		hasError, idx, size, unstyled,
	])

	const data = {
		disabled: !!disabled || null,
		invalid: hasError || null,
		loading: !!loading || null,
	}

	return (
		<Box
			{ ...styles('root') }
			{ ...others }
			as={ as }
			attributes={ { data } }
		>
			{ !!label && (
				<label { ...styles('label') } htmlFor={ idx.control }>
					{ label }
					{ required && <span { ...styles('required') } aria-hidden="true">*</span> }
				</label>
			) }

			<FieldProvider value={ ctxValues }>
				<div { ...styles('control') }>
					{ buildField(children) }
					{ !!loading && <Box { ...styles('indicator') } as={ LoaderCircle } /> }
				</div>
			</FieldProvider>

			{ hasError && <p { ...styles('error') }>{ error }</p> }
		</Box>
	)
}, { name: NAME, classes })

Field.set({
	defaultProps: DEFAULT_PROPS,
	displayName: NAME,
	subcomponents: SUBCOMPONENTS,
})

export declare namespace Field {
	export type Context = FieldContext
	export type Props = FieldProps
	export type Specs = FieldSpecs
}
