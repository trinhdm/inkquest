import { z } from 'zod'

export const emailRule = z.string()
	.min(1, 'Email is required.')
	.pipe(z.email('Invalid email address.'))
