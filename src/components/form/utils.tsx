import {
	Calendar, Calendar1, CalendarDays, Clock,
	Globe, Hash, Mail, Paperclip,
	Phone, Pipette, Search,
} from 'lucide-react'

import type { ComponentPropsWithoutRef } from 'react'

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
