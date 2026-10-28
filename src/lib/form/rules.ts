import { z } from 'zod'

export const emailRule = z.string()
	.min(1, 'Enter a valid email address.')
	.pipe(z.email('Invalid email address.'))
