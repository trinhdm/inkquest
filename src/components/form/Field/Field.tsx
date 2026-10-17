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
import { useParser } from '@/hooks/useParser'
import { defineTokens } from '@/lib/component/tokens'
import { extractOthers } from '@/hooks/useProps'
import { filterChildren } from '@/lib/component/children'
import { calcFieldBox, getIcon, type FieldPropsList } from '../utils'
import { keyHasValue, toKebabCase } from '@/utils/helpers'
import { polymorphic } from '@/lib/component/factory'
import { Box } from '@/components/polymorphic/Box'
import { Choice as ChoiceInput } from '../Choice'
import { FieldGroup } from './FieldGroup'
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
	Choice: ChoiceInput,
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
	readonly?: boolean
	required?: boolean
	type?: Field.Choice.Types | Field.Input.Types
}

interface FieldDefaultLayout {
	iconPosition?: 'left' | 'right'
	labelPosition?: 'first' | 'last'
	layout?: 'default'
	size?: Size
}

interface FieldInlineLayout {
	iconPosition?: never
	labelPosition?: 'first' | 'last'
	layout?: 'inline'
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
	| FieldInlineLayout

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
	| 'root' | 'container' | 'control' | 'choice'
	| 'error' | 'loader' | 'required'
	| 'info' | 'label' | 'caption'

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
	const { children, layout, loading } = props

	const displayNames = Object.values(SUBCOMPONENTS).map(sub => sub.displayName),
		verifyArgs = { name: NAME, max: 1 },
		control = filterChildren(children, displayNames, verifyArgs).find(Boolean)

	const parts: FieldParts = {
		control: null,
		icon: null,
		loader: null,
	}

	if (isValidElement<FieldPropsList>(control)) {
		const { props: controlProps } = control,
			clsxControl = layout === 'button' ? { global: { 'sr': true } } : {}

		parts.control = <div { ...styles('control', clsxControl) }>{ control }</div>

		if (control.type === TextInput) {
			const type = (controlProps as FieldPropsList<'input'>).type ?? props.type

			if (!!type) {
				const icon = getIcon(type)
				if (icon) parts.icon = icon
			}
		}

		if (!!loading || keyHasValue(controlProps, { loading: true }))
			parts.loader = <LoaderCircle { ...styles('loader', true) } />
	}

	return parts
}

const tokens = defineTokens<FieldSpecs>()(({ props, theme }) => {
	const fieldBox = calcFieldBox(props.size, theme)

	if (!fieldBox) return {}
	const { blockPadding, inlinePadding, iconSize } = fieldBox

	return {
		root: {
			'--field-icon-size': iconSize,
			'--field-padding-block': blockPadding,
			'--field-padding-inline': inlinePadding,
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
		loading, readonly, required,
		size, type, unstyled,
		...rest
	} = props

	const { control, icon, loader } = buildField(props, styles)

	const others = extractOthers(rest)
	const hasError = !!error?.trim()

	const uid = useId()
	const idx = useMemo(() => {
		const root = toKebabCase(id ?? uid)
		return { control: `${root}-control`, error: `${root}-error`, info: `${root}-info` }
	}, [id, uid])

	const aria = useMemo(() => {
		const describedby = []
		if (caption) describedby.push(idx.info)
		if (hasError) describedby.push(idx.error)

		return {
			busy: !!loading || undefined,
			describedby: describedby.join(' '),
			invalid: hasError || undefined,
			required: !!required || undefined,
		}
	}, [
		caption, hasError, idx,
		loading, required,
	])

	const clsx = useMemo(() => ({
		selector: {
			error: hasError,
			[`${layout}`]: !!layout && layout !== 'default',
		},
	} as FieldContext['clsx']), [
		hasError, layout,
	])

	const ctxValues = useMemo(() => ({
		aria, clsx, disabled, hasError,
		icon, idx, layout, loader, loading,
		required, size, type, unstyled,
	}), [
		aria, clsx, disabled, hasError,
		icon, idx, layout, loader, loading,
		required, size, type, unstyled,
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

	const labelEl = label && (
		<label { ...styles('label') } htmlFor={ idx.control }>
			{ label }
			{ !!required && <span { ...styles('required') } aria-hidden="true">*</span> }
		</label>
	)

	const captionEl = caption && (
		<span { ...styles('caption') } id={ idx.info }>{ useParser(caption) }</span>
	)

	const errorEl = hasError && <span { ...styles('error') } id={ idx.error }>{ error }</span>

	if (layout === 'button') {
		return (
			<Box { ...sharedProps } as={ as }>
				<FieldProvider value={ ctxValues }>
					{ control }
					<label { ...styles('choice') } htmlFor={ idx.control }>
						<span { ...styles('label', { global: { h5: true } }) }>{ label }</span>
						{ captionEl }
					</label>
				</FieldProvider>
			</Box>
		)
	}

	let infoEl = <div { ...styles('info') }>{ captionEl }{ errorEl }</div>
	const isFirst = !labelPosition || labelPosition === 'first',
		isLast = labelPosition === 'last'

	if (layout === 'inline') {
		return (
			<Box { ...sharedProps } as={ as }>
				{ isFirst && infoEl }

				<div { ...styles('container') }>
					{ labelEl }
					<FieldProvider value={ ctxValues }>
						{ control }
					</FieldProvider>
				</div>

				{ isLast && infoEl }
			</Box>
		)
	}

	infoEl = <div { ...styles('info') }>{ labelEl }{ errorEl }</div>

	return (
		<Box { ...sharedProps } as={ as }>
			{ isFirst && infoEl }

			<FieldProvider value={ ctxValues }>
				{ control }
			</FieldProvider>

			{ isLast && infoEl }
			{ captionEl }
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
		export type Props = ChoiceInput.Props
		export type Specs = ChoiceInput.Specs
		export type Types = ChoiceInput.Types
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
