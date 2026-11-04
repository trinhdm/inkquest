import { cookies } from 'next/headers'
import { accountSchema, type AccountValues } from './schema'
import { NavRoutes } from '@/utils/navigation'

const COOKIE = 'inkq_last_account',
	MAX_AGE = 60 * 10

const HINT_COOKIE = 'inkq_login_hint',
	HINT_MAX_AGE = 60

const writeAccount = async (name: string, values: AccountValues, maxAge: number) => {
	(await cookies()).set(name, JSON.stringify(values), {
		httpOnly: true,
		maxAge,
		path: NavRoutes.HOME,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
	})
}

const readAccount = async (name: string): Promise<AccountValues | null> => {
	const value = (await cookies()).get(name)?.value
	if (!value) return null

	try {
		const result = accountSchema.safeParse(JSON.parse(value))
		return result.success ? result.data : null
	} catch {
		return null
	}
}

export const rememberAccount = (values: AccountValues) =>
	writeAccount(COOKIE, values, MAX_AGE)

//	a display hint for this browser only, never proof of who someone is
export const getRememberedAccount = () => readAccount(COOKIE)

export const forgetRememberedAccount = async () => {
	(await cookies()).delete(COOKIE)
}

//	'Continue as: the account reaches the next /login render, then nowhere else
export const setLoginHint = async () => {
	const account = await getRememberedAccount()
	await forgetRememberedAccount()
	if (account) await writeAccount(HINT_COOKIE, account, HINT_MAX_AGE)
}

export const getLoginHint = () => readAccount(HINT_COOKIE)
