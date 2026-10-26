import { z } from 'zod'

export const signupSchema = z.object({
	email: z.email('Enter a valid email address.'),
	password: z.string().min(1, `Password doesn't meet the requirements.`),
})

export type SignupValues =
	z.infer<typeof signupSchema>
