import { deleteAccount, readAccount, writeAccount } from './cookies'
import { forgetAccount } from './account'
import { SESSION_COOKIE as COOKIE } from './constants'
import type { AccountValues } from './schema'

const MAX_AGE = 60 * 60 * 24 * 7

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

/** Starts a session and clears any remembered account or hint, so an old "Continue as" can't follow a new login. */
export const signIn = async (user: AccountValues) => {
	await startSession(user)
	await forgetAccount()
}
