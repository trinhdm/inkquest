import {
	Calendar, Calendar1, CalendarDays,
	Clock, Eye, Globe,
	Hash, Mail, Paperclip,
	Phone, Pipette, Search,
} from 'lucide-react'

import { defineSharedTokens, type TokensParams } from '@/lib/component/tokens'
import { keyHasValue } from '@/utils/helpers'
import type { HTMLInputTypeAttribute } from 'react'
import type { Field } from './Field'
import type { Form } from './Form'
import type { SafeRootCtxValue } from '@/lib/component/context'
import type { SiteThemeConfig } from '@/lib/theme/types'
import type { SpecsTokenGroups } from '@/lib/component/factory/types'

export const getIcon = (type?: HTMLInputTypeAttribute) => {
	switch (type) {
		case 'color':		return <Pipette />
		case 'date':		return <Calendar />
		case 'email':		return <Mail />
		case 'file':		return <Paperclip />
		case 'month':		return <Calendar1 />
		case 'number':		return <Hash />
		case 'password':	return <Eye />
		case 'search':		return <Search />
		case 'tel':			return <Phone />
		case 'time':		return <Clock />
		case 'url':			return <Globe />
		case 'week':		return <CalendarDays />
		default:			return null
	}
}


type FieldSpecsList = {
	group: Field.Group.Specs
	root: Field.Specs
}

type FieldName =
	keyof FieldSpecsList

interface FormErrorsArgs<N extends FieldName> {
	context?: {
		form?: SafeRootCtxValue<Form.Context, 'Form'>
		group?: SafeRootCtxValue<Field.Group.Context, 'Field.Group'>
	}
	name: string | undefined
	props: FieldSpecsList[N]['props']
}

export const getFormErrors = <N extends FieldName>({
	context = {},
	name,
	props,
}: FormErrorsArgs<N>) => {
	const { form, group } = context ?? { form: undefined, group: undefined }

	const formError = name && !group ? form?.errors[name] : undefined,
		propError = keyHasValue(props, 'error') && typeof props.error === 'string'
			? props.error
			: undefined

	const error = propError ?? formError,
		invalid = keyHasValue(props, 'invalid') ? props.invalid : undefined

	const hasError = !!error?.trim(),
		isInvalid = hasError || !!invalid

	return { error, hasError, isInvalid }
}


export type InputTokens = {
	root:
		| '--form-control-padding'
	icon:
		| '--form-control-icon-inset'
}

export type FlattenInputTokens =
	InputTokens[keyof InputTokens]

type InputSpecsList = {
	choice: Field.Choice.Specs
	input: Field.Input.Specs
	number: Field.Number.Specs
	textarea: Field.Textarea.Specs
		& { tokens: { root: FlattenInputTokens } }
}

type InputName =
	keyof InputSpecsList

export type InputPropsList<N extends InputName = InputName> =
	InputSpecsList[N]['props']

export const calcInputBox = (
	size: Field.Props['size'],
	theme: SiteThemeConfig,
) => {
	if (!size) return

	const iconSize = `calc(${theme.el.icon.size(size)} - .125rem)`,
		iconSpace = theme.space('icon')

	const blockPadding = theme.el.field.padding(size),
		inlinePadding = `calc(${iconSpace} + ${blockPadding})`

	const iconMargin = `calc(2 * ${inlinePadding})`,
		iconPadding = `calc(${iconMargin} + ${iconSize} - ${iconSpace})`

	return {
		blockPadding, inlinePadding,
		iconMargin, iconPadding,
		iconSize, iconSpace,
	}
}

const determineInputTokens = <
	N extends InputName,
	S extends InputSpecsList[N]
>({
	context,
	props,
	theme,
}: TokensParams<S>) => {
	if (!context) return

	const { icon, layout } = context
	const size = props.size ?? context.size,
		fieldBox = calcInputBox(size, theme)

	if (!fieldBox) return

	const { blockPadding, inlinePadding, iconPadding } = fieldBox
	const buffer = layout === 'inline' ? `calc(3 * ${iconPadding})` : iconPadding,
		padding = `${blockPadding} ${inlinePadding}`

	let iconPosition
	const isPassword = keyHasValue(props, { type: 'password' })
	const isIconLeft = !keyHasValue(props, 'iconPosition')
		|| keyHasValue(props, { iconPosition: 'left' })

	if (isPassword) iconPosition = 'auto 0'
	else if (!!icon) iconPosition = isIconLeft ? '0 auto' : 'auto 0'

	const controlPadding = isIconLeft && !isPassword
		? `${padding} ${blockPadding} ${buffer}`
		: `${blockPadding} ${buffer} ${padding}`

	return {
		fieldPadding: !!icon ? controlPadding : padding,
		iconPosition,
	}
}

export const listSharedTokens = <
	N extends InputName = 'input',
	S extends InputSpecsList[N] = InputSpecsList[N]
>(
	args: TokensParams<S>,
	name: N = 'input' as N,
): SpecsTokenGroups<S> => {
	const sharedTokens = determineInputTokens<N, S>(args)

	if (!sharedTokens) return {} as SpecsTokenGroups<S>
	const { fieldPadding, iconPosition } = sharedTokens

	const tokens: SpecsTokenGroups<InputSpecsList['input']> = {
		root: {
			'--form-control-padding': fieldPadding,
		},
		icon: {
			'--form-control-icon-inset': iconPosition,
		},
	}

	const textarea: SpecsTokenGroups<InputSpecsList['textarea']> = {
		root: { ...tokens.root, ...tokens.icon },
	}

	return (name === 'textarea' ? textarea : tokens) as SpecsTokenGroups<S>
}

export const getSharedTokens = <N extends InputName = 'input'>(name: N = 'input' as N) =>
	defineSharedTokens<InputSpecsList, N>(listSharedTokens, name)
