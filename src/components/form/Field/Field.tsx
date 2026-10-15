import {
	isValidElement,
	useId, useMemo,
	type ReactNode,
} from 'react'

import {
	FieldProvider,
	type FieldContext,
	type SharedFieldProps,
} from './Field.context'

import { LoaderCircle } from 'lucide-react'
import { useFieldGroupProps } from './FieldGroup'
import { defineTokens } from '@/lib/component/tokens'
import { extractOthers } from '@/hooks/useProps'
import { filterChildren } from '@/lib/component/children'
import { getIcon, type FieldPropsList } from '../utils'
import { keyHasValue, toKebabCase } from '@/utils/helpers'
import { polymorphic } from '@/lib/component/factory'
import { Box } from '@/components/polymorphic/Box'
import { FieldGroup } from './FieldGroup'
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
	required: false,
	size: 'md',
} as const

export const SUBCOMPONENTS = {
	Choice: Radio,
	Group: FieldGroup,
	Input: TextInput,
	Textarea: TextArea,
	// Upload: FileUpload,
} as const

interface BaseFieldProps {
	caption?: string
	children: ReactNode
	disabled?: boolean
	error?: string
	id: string
	label?: string
	loading?: boolean
	required?: boolean
}

interface FieldDefaultLayout {
	labelPosition?: 'first' | 'last'
	layout?: 'default'
	size?: Size
}

interface FieldButtonLayout {
	iconPosition?: never
	labelPosition?: never
	layout: 'button'
	size?: never
}

type FieldLayoutProps =
	| FieldButtonLayout
	| FieldDefaultLayout

type FieldProps =
	& BaseFieldProps
	& FieldLayoutProps

interface FieldSpecs {
	context: FieldGroup.Context
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
	| 'root' | 'control' | 'button'
	| 'error' | 'caption' | 'loader'
	| 'label' | 'required'

type FieldTokens = {
	root:
		| '--field-icon-size'
		| '--field-padding-block'
		| '--field-padding-inline'
}

interface FieldParts {
	control: ReactNode
	icon: ReactNode
	loader: ReactNode
}

const buildField = (
	props: FieldProps,
	styles: StyleFn<FieldSpecs>,
): FieldParts => {
	const { children, loading } = props

	const displayNames = Object.values(SUBCOMPONENTS).map(sub => sub.displayName),
		verifyArgs = { name: NAME, max: 1 },
		control = filterChildren(children, displayNames, verifyArgs).find(Boolean)

	const parts: FieldParts = {
		control: null,
		icon: null,
		loader: null,
	}

	if (isValidElement<FieldPropsList>(control)) {
		const { props: childProps } = control
		parts.control = <div { ...styles('control') }>{ control }</div>

		if (keyHasValue(childProps, 'type')) {
			const icon = getIcon((childProps as TextInput.Props).type)
			if (icon) parts.icon = icon
		}

		if (!!loading || keyHasValue(childProps, { loading: true }))
			parts.loader = <LoaderCircle { ...styles('loader', true) } />
	}

	return parts
}

const tokens = defineTokens<FieldSpecs>()(({ props, theme }) => {
	const { size } = props

	const blockPadding = 'var(--field-padding-block)',
		inlinePadding = `calc(${theme.space('icon')} + ${blockPadding})`

	return {
		root: {
			'--field-icon-size': !!size ? `calc(${theme.el.icon.size(size)} - .125rem)` : undefined,
			'--field-padding-block': !!size ? theme.el.field.padding(size) : undefined,
			'--field-padding-inline': !!size ? inlinePadding : undefined,
		},
	}
})

export const Field = polymorphic<FieldSpecs>((_props, { useProps, useStyles }) => {
	const props = useProps(useFieldGroupProps(_props))
	const styles = useStyles({ props, tokens })

	const {
		as, caption, children,
		disabled, error, id,
		label, labelPosition, layout,
		loading, required, size, unstyled,
		...rest
	} = props

	const { control, icon, loader } = buildField(props, styles)

	const others = extractOthers(rest)
	const hasError = !!error?.trim()

	const uid = useId()
	const idx = useMemo(() => {
		const root = toKebabCase(id ?? uid)
		return { control: `${root}-control`, error: `${root}-error` }
	}, [id, uid])

	const aria = useMemo(() => ({
		busy: !!loading || undefined,
		describedby: hasError ? idx.error : undefined,
		invalid: hasError || undefined,
		required: !!required || undefined,
	}), [hasError, idx, loading, required])

	const clsx = useMemo(() => ({
		selector: {
			error: hasError,
			[`${layout}`]: layout,
		},
	}), [hasError, layout])

	const ctxValues = useMemo(() => ({
		aria, clsx, disabled, hasError,
		icon,  idx, loader, loading,
		required, size, unstyled,
	}), [
		aria, clsx, disabled, hasError,
		icon, idx, loader, loading,
		required, size, unstyled,
	])

	const sharedProps = {
		...styles('root', clsx),
		...others,
		attributes: { data: {
			disabled: !!disabled || null,
			invalid: hasError || null,
			loading: !!loading || null,
		} },
	}

	const clsxText = { global: { caption: true } }
	const captionEl = caption && <span { ...styles('caption', clsxText) }>{ caption }</span>

	if (layout === 'button') {
		return (
			<Box { ...sharedProps }>
				<FieldProvider value={ ctxValues }>
					{ control }
					<label { ...styles('button') } htmlFor={ idx.control }>
						<span { ...styles('label', { global: { h5: true } }) }>{ label }</span>
						{ captionEl }
					</label>
				</FieldProvider>
			</Box>
		)
	}

	const labelEl = label && (
		<label { ...styles('label') } htmlFor={ idx.control }>
			{ label }
			{ !!required && <span { ...styles('required') } aria-hidden="true">*</span> }
		</label>
	)

	return (
		<Box { ...sharedProps }>
			{ (!labelPosition || labelPosition === 'first') && labelEl }

			<FieldProvider value={ ctxValues }>
				{ control }
			</FieldProvider>

			{ labelPosition === 'last' && labelEl }
			{ captionEl }

			{ hasError && (
				<span { ...styles('error', clsxText) } id={ idx.error }>
					{ error }
				</span>
			) }
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

	export type LayoutProps = FieldLayoutProps
	export type SharedProps = SharedFieldProps

	export namespace Group {
		export type Context = FieldGroup.Context
		export type Props = FieldGroup.Props
		export type Specs = FieldGroup.Specs
	}

	export namespace Choice {
		export type Props = Radio.Props
		export type Specs = Radio.Specs
	}

	export namespace Input {
		export type Props = TextInput.Props
		export type Specs = TextInput.Specs
		export type Types = TextInput.Types
	}

	export namespace Textarea {
		export type Props = TextArea.Props
		export type Specs = TextArea.Specs
	}
}
