import { z } from 'zod'

export const accountSchema = z.object({
	email: z.email(),
	name: z.string().max(100).optional(),
})

export type AccountValues =
	z.infer<typeof accountSchema>

export const parseAccount = (value: string | undefined): AccountValues | null => {
	if (!value) return null

	try {
		const result = accountSchema.safeParse(JSON.parse(value))
		return result.success ? result.data : null
	} catch {
		return null
	}
}
