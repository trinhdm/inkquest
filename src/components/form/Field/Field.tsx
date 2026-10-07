import {
	isValidElement,
	useId, useMemo,
	type ReactNode,
} from 'react'

import { LoaderCircle } from 'lucide-react'
import { defineTokens } from '@/lib/component/tokens'
import { extractOthers } from '@/hooks/useProps'
import { filterChildren, getDisplayNames } from '@/lib/component/children'
import { getIcon, type FieldPropsList } from '../utils'
import { keyHasValue, toKebabCase } from '@/utils/helpers'
import { polymorphic } from '@/lib/component/factory'
import { Box } from '@/components/polymorphic/Box'
import { FieldGroup } from './FieldGroup'
import { FieldLabel } from './FieldLabel'
import { FieldProvider, type FieldContext, type SharedFieldProps } from './Field.context'
import { Radio } from '../Radio'
import { TextArea } from '../TextArea'
import { TextInput } from '../TextInput'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import type { Size } from '@/types/shared'
import type { StyleFn } from '@/hooks/useStyles'
import classes from './Field.module.scss'

const NAME = 'Field' as const,
	TAG = 'div' as const

const DEFAULT_PROPS = {
	as: TAG,
	preserveOrder: true,
	required: false,
	size: 'md',
} as const

export const SUBCOMPONENTS = {
	// FileUpload,
	Choice: Radio,
	Group: FieldGroup,
	Input: TextInput,
	Label: FieldLabel,
	Textarea: TextArea,
} as const

interface FieldProps {
	children: ReactNode
	disabled?: boolean
	error?: string
	id: string
	loading?: boolean
	preserveOrder?: boolean
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

const nameSubcomponents = (list = SUBCOMPONENTS) => {
	const labelKey: keyof typeof list = 'Label'
	const { [labelKey]: value, Group, ...rest } = list,
		reordered = { [labelKey]: value, ...rest }

	return Object.values(reordered).map(sub => sub.displayName)
}

const orderSubcomponents = (
	props: FieldProps,
	parts: FieldParts,
): ReactNode[] => {
	const { children, preserveOrder } = props
	const { control, label } = parts

	if (!preserveOrder) return [label, control]
	const displayNames = getDisplayNames(children)

	if (displayNames[0] === FieldLabel.displayName)
		return [label, control]

	return [control, label]
}

const buildField = (
	props: FieldProps,
	styles: StyleFn<FieldSpecs>,
): FieldParts => {
	const { children, loading } = props

	const [labelName, ...displayNames] = nameSubcomponents(),
		verifyArgs = { name: NAME, max: 1 }

	const [label] = filterChildren(children, labelName, verifyArgs),
		control = filterChildren(children, displayNames, verifyArgs).find(Boolean)

	const parts: FieldParts = {
		control: null,
		icon: null,
		label: null,
		loader: null,
	}

	if (isValidElement<FieldPropsList>(label))
		parts.label = label

	if (isValidElement<FieldPropsList>(control)) {
		const { props: childProps } = control
		parts.control = <div { ...styles('control') }>{ control }</div>

		if (keyHasValue(childProps, 'type')) {
			const icon = getIcon((childProps as TextInput.Props).type)
			if (icon) parts.icon = <div { ...styles('icon') }>{ icon }</div>
		}

		if (!!loading || keyHasValue(childProps, { loading: true }))
			parts.loader = <LoaderCircle { ...styles('loader', true) } />
	}

	return parts
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

	const parts = buildField(props, styles)

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
		selector: { error: hasError },
	}), [hasError, size])

	const ctxValues = useMemo(() => ({
		aria, clsx, disabled, hasError, idx,
		icon: parts.icon, loader: parts.loader,
		loading, required, size, unstyled,
	}), [
		aria, clsx, disabled, hasError,
		idx, loading, parts,
		required, size, unstyled,
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
				{ orderSubcomponents(props, parts) }
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

	export namespace Group {
		export type Props = FieldGroup.Props
		export type Specs = FieldGroup.Specs
	}

	export namespace Label {
		export type Props = FieldLabel.Props
		export type Specs = FieldLabel.Specs
	}

	export namespace Choice {
		export type Props = Radio.Props
		export type Specs = Radio.Specs
	}

	export namespace Input {
		export type Props = TextInput.Props
		export type Specs = TextInput.Specs
	}

	export namespace Textarea {
		export type Props = TextArea.Props
		export type Specs = TextArea.Specs
	}
}
