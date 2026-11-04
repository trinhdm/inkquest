import { deleteAccount, readAccount, writeAccount } from './cookies'
import type { AccountValues } from './schema'

const COOKIE = 'inkq_last_account',
	MAX_AGE = 60 * 10

const HINT_COOKIE = 'inkq_login_hint',
	HINT_MAX_AGE = 60

//	a new logout should be clean
export const rememberAccount = async (values: AccountValues) => {
	await deleteAccount(HINT_COOKIE)
	await writeAccount(COOKIE, values, MAX_AGE)
}

export const forgetAccount = async () => {
	await deleteAccount(COOKIE)
	await deleteAccount(HINT_COOKIE)
}

//	a display hint for this browser only, never proof of who someone is
export const recallAccount = () => readAccount(COOKIE)

//	continue as: the account reaches the next /login render, then nowhere else
export const handoverAccount = async () => {
	const account = await recallAccount()
	await forgetAccount()
	if (account) await writeAccount(HINT_COOKIE, account, HINT_MAX_AGE)
}

export const suggestAccount = () => readAccount(HINT_COOKIE)
