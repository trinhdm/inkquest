import { z } from 'zod'

export const CLIENT_TOPICS = ['general', 'booking', 'payments'] as const

export const ARTIST_TOPICS = [
	'general', 'payments', 'verification',
	'press', 'safety', 'partnerships',
] as const

const MIN_CHAR = 50

const contact = {
	email: z.email('Enter a valid email address.'),
	message: z.string().trim().min(MIN_CHAR, `Tell us a bit more - ${MIN_CHAR} characters minimum.`),
	name: z.string().trim().min(1, 'Enter your name.'),
	screenshots: z.string().trim().optional(),
}

export const clientSchema = z.object({
	...contact,
	topic: z.enum(CLIENT_TOPICS, 'Choose what your message is about.'),
})

export const artistSchema = z.object({
	...contact,
	topic: z.enum(ARTIST_TOPICS, 'Choose what your message is about.'),
})
