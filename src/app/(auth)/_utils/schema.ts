import { z } from 'zod'

export const accountSchema = z.object({
	email: z.email(),
	name: z.string().max(100).optional(),
})

export type AccountValues =
	z.infer<typeof accountSchema>
