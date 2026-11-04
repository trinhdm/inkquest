import { deleteAccount, readAccount, writeAccount } from './cookies'
import type { AccountValues } from './schema'

const COOKIE = 'inkq_session',
	MAX_AGE = 60 * 60 * 24 * 7

//	mock: the cookie holds the account itself; a real backend replaces these three bodies
export const startSession = async (user: AccountValues) => {
	await writeAccount(COOKIE, user, MAX_AGE)
}

/** Returns `null` for a missing, unreadable or malformed cookie. In this mock it is a display hint, not proof of who someone is. */
export const getSession = async (): Promise<AccountValues | null> =>
	await readAccount(COOKIE)

export const endSession = async () => {
	await deleteAccount(COOKIE)
}
