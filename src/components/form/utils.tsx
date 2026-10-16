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

export type FieldTokens = {
	root:
		| '--form-control-padding'
	icon:
		| '--form-control-icon-inset'
}

export type FlattenFieldTokens =
	FieldTokens[keyof FieldTokens]

type FieldSpecsList = {
	choice: Field.Choice.Specs
	input: Field.Input.Specs
	textarea: Field.Textarea.Specs
		& { tokens: { root: FlattenFieldTokens } }
}

type FieldName =
	keyof FieldSpecsList

export type FieldPropsList<N extends FieldName = FieldName> =
	FieldSpecsList[N]['props']

export const listSharedTokens = <
	N extends FieldName = 'input',
	S extends FieldSpecsList[N] = FieldSpecsList[N]
>(
	args: TokensParams<S>,
	name: N = 'input' as N,
): SpecsTokenGroups<S> => {
	const { context, props, theme } = args
	if (!context) return {} as SpecsTokenGroups<S>

	const { icon } = context
	const size = props.size ?? context.size

	const iconSpace = theme.space('icon'),
		iconSize = 'var(--field-icon-size)'

	const isIconLeft = !keyHasValue(props, 'iconPosition')
		|| keyHasValue(props, { iconPosition: 'left' })

	const blockPadding = !!size ? theme.el.field.padding(size) : 'var(--field-padding-block)',
		inlinePadding = `calc(${iconSpace} + ${blockPadding})`,
		padding = `${blockPadding} ${inlinePadding}`

	const iconMargin = `calc(2 * ${inlinePadding})`,
		iconPadding = `calc(${iconMargin} + ${iconSize} - ${iconSpace})`,
		iconPosition = !!icon && isIconLeft ? '0 auto' : 'auto 0'

	const controlPadding = isIconLeft
		? `${padding} ${blockPadding} ${iconPadding}`
		: `${blockPadding} ${iconPadding} ${padding}`

	const tokens: SpecsTokenGroups<FieldSpecsList['input']> = {
		root: {
			'--form-control-padding': !!icon ? controlPadding : padding,
		},
		icon: {
			'--form-control-icon-inset': iconPosition,
		},
	}

	const textarea: SpecsTokenGroups<FieldSpecsList['textarea']> = {
		root: { ...tokens.root, ...tokens.icon },
	}

	return (name === 'textarea' ? textarea : tokens) as SpecsTokenGroups<S>
}

export const getSharedTokens = <N extends FieldName = 'input'>(name: N = 'input' as N) =>
	defineSharedTokens<FieldSpecsList, N>(listSharedTokens, name)
