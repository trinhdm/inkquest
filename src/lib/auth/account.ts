import { deleteAccount, readAccount, writeAccount } from './cookies'
import type { AccountValues } from './schema'

const COOKIE = 'inkq_last_account',
	MAX_AGE = 60 * 10

const HINT_COOKIE = 'inkq_login_hint',
	HINT_MAX_AGE = 60

export const rememberAccount = (values: AccountValues) =>
	writeAccount(COOKIE, values, MAX_AGE)

//	a display hint for this browser only, never proof of who someone is
export const getRememberedAccount = () => readAccount(COOKIE)

export const forgetRememberedAccount = () => deleteAccount(COOKIE)

//	continue as: the account reaches the next /login render, then nowhere else
export const setAccountHint = async () => {
	const account = await getRememberedAccount()
	await forgetRememberedAccount()
	if (account) await writeAccount(HINT_COOKIE, account, HINT_MAX_AGE)
}

export const getAccountHint = () => readAccount(HINT_COOKIE)
