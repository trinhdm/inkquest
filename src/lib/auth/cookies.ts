import { cookies } from 'next/headers'
import { accountSchema, type AccountValues } from './schema'

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

export const readAccount = async (name: string): Promise<AccountValues | null> => {
	const value = (await cookies()).get(name)?.value
	if (!value) return null

	try {
		const result = accountSchema.safeParse(JSON.parse(value))
		return result.success ? result.data : null
	} catch {
		return null
	}
}

export const deleteAccount = async (name: string) => {
	(await cookies()).delete(name)
}
