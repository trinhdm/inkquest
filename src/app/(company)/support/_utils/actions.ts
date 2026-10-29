'use server'

import { action } from '@/lib/form'
import { artistSchema, clientSchema } from './schema'

const FIELDS = ['name', 'email', 'topic', 'message', 'screenshots'] as const,
	THANKS = 'Thanks, we\'ll reply within 2 working days.'

const config = {
	names: FIELDS,
	onSuccess: () => ({ message: THANKS, values: {} }),
}

export const sendClientSupport = action(clientSchema, config)
export const sendArtistSupport = action(artistSchema, config)
