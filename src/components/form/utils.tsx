import {
	Calendar, Calendar1, CalendarDays, Clock,
	Eye,
	Globe, Hash, Mail, Paperclip,
	Phone, Pipette, Search,
} from 'lucide-react'

import type { HTMLInputTypeAttribute } from 'react'
import type { Field } from './Field'
import type { TokensConfig } from '@/lib/component/tokens/defineTokens'
import { keyHasValue } from '@/utils/helpers'

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

export type FieldPropsList =
	| Field.Choice.Props
	| Field.Input.Props
	| Field.Textarea.Props

type FieldSpecsList =
	| Field.Choice.Specs
	| Field.Input.Specs
	| Field.Textarea.Specs

export const getSharedTokens: TokensConfig<FieldSpecsList> = ({
	context,
	props,
	theme,
}) => {
	const { icon } = context
	const { size } = props

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

	return {
		root: {
			'--form-control-padding': !!icon ? controlPadding : padding,
		},
		icon: {
			'--form-control-icon-inset': iconPosition,
		},
	}
}
