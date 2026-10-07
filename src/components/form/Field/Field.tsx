import {
	isValidElement,
	useId, useMemo,
	type ReactNode,
} from 'react'

import { defineTokens } from '@/lib/component/tokens'
import { extractOthers } from '@/hooks/useProps'
import { filterChildren } from '@/lib/component/children'
import { getIcon } from '../utils'
import { LoaderCircle } from 'lucide-react'
import { polymorphic } from '@/lib/component/factory'
import { toKebabCase } from '@/utils/helpers'
import { Box } from '@/components/polymorphic/Box'
import { FieldLabel } from './FieldLabel'
import { FieldProvider, type FieldContext, type SharedFieldProps } from './Field.context'
import { TextInput } from '../TextInput'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import type { Size } from '@/types/shared'
import type { StyleFn } from '@/hooks/useStyles'
import classes from './Field.module.scss'
import { TextArea } from '../TextArea'

const NAME = 'Field' as const,
	TAG = 'div' as const

const DEFAULT_PROPS = {
	as: TAG,
	required: false,
	size: 'md',
} as const

export const SUBCOMPONENTS = {
	// FileUpload,
	Input: TextInput,
	Label: FieldLabel,
	TextArea,
} as const

interface FieldProps {
	children: ReactNode
	disabled?: boolean
	error?: string
	id: string
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
	tokens: FieldTokens
}

type FieldSelectors =
	| 'root' | 'control' | 'error'
	| 'icon' | 'loader'

type FieldTokens = {
	root:
		| '--field-icon-size'
		| '--field-padding-block'
		| '--field-padding-inline'
}

interface FieldParts {
	control: ReactNode
	icon: ReactNode
	label: ReactNode
	loader: ReactNode
}

const buildField = (
	props: FieldProps,
	styles: StyleFn<FieldSpecs>,
): FieldParts => {
	const { children, loading } = props

	const displayNames = [
		FieldLabel.displayName,
		TextInput.displayName,
		TextArea.displayName,
	]

	const verifyArgs = { name: NAME, max: 2 }
	const [label, control] = filterChildren(children, displayNames, verifyArgs)

	const items = {
		control,
		icon: null,
		label,
		loader: null,
	} as FieldParts

	if (isValidElement<TextInput.Props>(control)) {
		const icon = getIcon(control.props.type)

		if (icon) items.icon = <div { ...styles('icon') }>{ icon }</div>
		if (loading) items.loader = <LoaderCircle { ...styles('loader', true) } />
	}

	return items
}

const tokens = defineTokens<FieldSpecs>()(({ props, theme }) => {
	const { size } = props

	const step = size === 'sm' ? 2 : 1.25
	const blockPadding = 'var(--field-padding-block)',
		inlinePadding = `calc(${step} * ${blockPadding})`

	return {
		root: {
			'--field-icon-size': !!size ? `calc(${theme.el.icon.size(size)} - .125rem)` : undefined,
			'--field-padding-block': !!size ? theme.el.field.padding(size) : undefined,
			'--field-padding-inline': !!size ? inlinePadding : undefined,
		},
	}
})

export const Field = polymorphic<FieldSpecs>((_props, { useProps, useStyles }) => {
	const props = useProps(_props)
	const styles = useStyles({ props, tokens })

	const {
		as, children, disabled,
		error, id, loading,
		required, size, unstyled,
		...rest
	} = props

	const {
		control, icon,
		label, loader,
	} = buildField(props, styles)

	const others = extractOthers(rest)
	const hasError = !!error?.trim()

	const uid = useId()
	const idx = useMemo(() => {
		const root = toKebabCase(id ?? uid),
			control = `${root}-control`,
			error = `${root}-error`
		return { control, error }
	}, [id, uid])

	const aria = useMemo(() => ({
		busy: !!loading || undefined,
		describedby: idx.error,
		invalid: hasError || undefined,
		required: !!required || undefined,
	}), [hasError, idx, loading, required])

	const clsx = useMemo(() => ({
		module: { [`${size}`]: size },
	}), [size])

	const ctxValues = useMemo(() => ({
		aria, clsx, disabled, hasError,
		icon, loader, loading,
		idx, required, size, unstyled,
	}), [
		aria, clsx, disabled, hasError,
		icon, loader, loading,
		idx, required, size, unstyled,
	])

	return (
		<Box
			{ ...styles('root', clsx) }
			{ ...others }
			as={ as }
			attributes={ { data: {
				disabled: !!disabled || null,
				invalid: hasError || null,
				loading: !!loading || null,
			} } }
		>
			<FieldProvider value={ ctxValues }>
				{ label }

				<div { ...styles('control') }>
					{ control }
				</div>

				{ hasError && <p { ...styles('error') }>{ error }</p> }
			</FieldProvider>
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

	export type SharedProps = SharedFieldProps
}
