import { cookies } from 'next/headers'
import { accountSchema, type AccountValues } from './schema'
import { NavRoutes } from '@/utils/navigation'

const COOKIE = 'inkq_session',
	MAX_AGE = 60 * 60 * 24 * 7

//	mock: the cookie holds the account itself; a real backend replaces these three bodies
export const startSession = async (user: AccountValues) => {
	(await cookies()).set(COOKIE, JSON.stringify(user), {
		httpOnly: true,
		maxAge: MAX_AGE,
		path: NavRoutes.HOME,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
	})
}

/** Returns `null` for a missing, unreadable or malformed cookie. In this mock it is a display hint, not proof of who someone is. */
export const getSession = async (): Promise<AccountValues | null> => {
	const value = (await cookies()).get(COOKIE)?.value
	if (!value) return null
	try {
		const result = accountSchema.safeParse(JSON.parse(value))
		return result.success ? result.data : null
	} catch {
		return null
	}
}

export const endSession = async () => {
	(await cookies()).delete(COOKIE)
}
