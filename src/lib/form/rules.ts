import { z } from 'zod'

export const emailRule = z.string()
	.min(1, 'Enter a valid email address.')
	.pipe(z.email('Invalid email address.'))

export const telRule = z.string()
	.transform(value => {
		const digits = value.replace(/\D/g, '')
		return digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits
	})
	.refine(
		value => /^\d{10}$/.test(value),
		{ message: 'Please enter a valid 10-digit phone number' }
	)
	.transform(value => `+1${value}`)
