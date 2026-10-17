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
import type { SiteThemeConfig } from '@/lib/theme/types'

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

export const calcFieldBox = (
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

export const listSharedTokens = <
	N extends FieldName = 'input',
	S extends FieldSpecsList[N] = FieldSpecsList[N]
>(
	args: TokensParams<S>,
	name: N = 'input' as N,
): SpecsTokenGroups<S> => {
	const { context, props, theme } = args
	if (!context) return {} as SpecsTokenGroups<S>

	const { icon, layout } = context
	const size = props.size ?? context.size

	const fieldBox = calcFieldBox(size, theme)
	if (!fieldBox) return {} as SpecsTokenGroups<S>

	const { blockPadding, inlinePadding, iconPadding } = fieldBox

	const isIconLeft = !keyHasValue(props, 'iconPosition')
		|| keyHasValue(props, { iconPosition: 'left' })

	const iconPosition = !!icon && isIconLeft ? '0 auto' : 'auto 0',
		buffer = layout === 'inline' ? `calc(3 * ${iconPadding})` : iconPadding,
		padding = `${blockPadding} ${inlinePadding}`

	const controlPadding = isIconLeft
		? `${padding} ${blockPadding} ${buffer}`
		: `${blockPadding} ${buffer} ${padding}`

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
