import { cookies } from 'next/headers'
import { z } from 'zod'

const COOKIE = 'inkq_last_account',
	MAX_AGE = 60 * 60 * 24 * 30

const accountSchema = z.object({
	email: z.email(),
	name: z.string().max(100).optional(),
})

export type RememberedAccount =
	z.infer<typeof accountSchema>

export const rememberAccount = async (account: RememberedAccount) => {
	(await cookies()).set(COOKIE, JSON.stringify(account), {
		httpOnly: true,
		maxAge: MAX_AGE,
		path: '/',
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
	})
}

//	a display hint for this browser only, never proof of who someone is
export const getRememberedAccount = async (): Promise<RememberedAccount | null> => {
	const value = (await cookies()).get(COOKIE)?.value
	if (!value) return null

	try {
		const result = accountSchema.safeParse(JSON.parse(value))
		return result.success ? result.data : null
	} catch {
		return null
	}
}

export const forgetRememberedAccount = async () => {
	(await cookies()).delete(COOKIE)
}
