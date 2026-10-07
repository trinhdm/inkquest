import {
	Calendar, Calendar1, CalendarDays, Clock,
	Globe, Hash, Mail, Paperclip,
	Phone, Pipette, Search,
} from 'lucide-react'

import type { ComponentPropsWithoutRef } from 'react'
import type { Field } from './Field'
import type { TokensConfig } from '@/lib/component/tokens/defineTokens'

export const getIcon = (type?: ComponentPropsWithoutRef<'input'>['type']) => {
	switch (type) {
		case 'color':	return <Pipette />
		case 'date':	return <Calendar />
		case 'email':	return <Mail />
		case 'file':	return <Paperclip />
		case 'month':	return <Calendar1 />
		case 'number':	return <Hash />
		case 'search':	return <Search />
		case 'tel':		return <Phone />
		case 'time':	return <Clock />
		case 'url':		return <Globe />
		case 'week':	return <CalendarDays />
		default:		return null
	}
}

export type FieldTokens = {
	root:
		| '--form-control-padding'
}

type FieldSpecsList =
	| Field.Input.Specs
	| Field.Textarea.Specs

export const getSharedTokens: TokensConfig<FieldSpecsList> = ({
	context,
	props,
	theme,
}) => {
	const { icon } = context
	const { size } = props

	const step = !!icon ? 2 : 1.5
	const blockPadding = !!size ? theme.el.field.padding(size) : 'var(--field-padding-block)',
		inlinePadding = `calc(${step} * ${blockPadding})`,
		padding = `${blockPadding} ${inlinePadding}`

	const iconMargin = size === 'sm' ? `calc(1.5 * ${inlinePadding})` : inlinePadding,
		leftPadding = `calc(${iconMargin} + var(--field-icon-size))`

	return {
		root: {
			'--form-control-padding': !!icon
				? `${padding} ${blockPadding} ${leftPadding}`
				: padding,
		},
	}
}
