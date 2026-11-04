import { cookies } from 'next/headers'
import { parseAccount, type AccountValues } from './schema'

export const writeAccount = async (
	name: string,
	values: AccountValues,
	maxAge: number,
) => {
	(await cookies()).set(name, JSON.stringify(values), {
		httpOnly: true,
		maxAge,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
	})
}

export const readAccount = async (name: string): Promise<AccountValues | null> =>
	parseAccount((await cookies()).get(name)?.value)

export const deleteAccount = async (name: string) => {
	(await cookies()).delete(name)
}
