import { z } from 'zod'
import { emailRule, validateWith } from '@/lib/form'

export type SignupValues =
	z.infer<typeof signupSchema>

export const signupSchema = z.object({
	email: emailRule,
	password: z.string().min(1, `Password doesn't meet the requirements.`),
})

export const validateSignup = validateWith(signupSchema)
