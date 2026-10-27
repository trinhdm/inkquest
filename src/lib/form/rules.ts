import { z } from 'zod'

export const emailRule = z.string()
	.min(1, 'Enter your email address.')
	.pipe(z.email('Invalid email address.'))
