import { dispatchGenerator } from './dispatch'
import type { CSSVars } from '@/types/shared'
import type { RecordToMap } from '@/types/utils'

const generateTokens = <T extends Record<string, unknown>>(
	input: T,
	prepend?: string
): CSSVars => {
	const variables: RecordToMap<CSSVars> = new Map()
	let entries = dispatchGenerator({ value: input, path: [], prefix: prepend })

	for (const { name, value } of entries)
		variables.set(name, String(value))

	return Object.fromEntries(variables) as CSSVars
}

export const tokenGenerator = generateTokens
