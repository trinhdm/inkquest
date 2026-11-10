import { z } from 'zod'
import { pause, pickValues, showMessage } from './state'
import { ACTION_DELAY, BASE_ERROR } from './constants'
import type { FormState } from './types'
import type { RequireSome } from '@/types/utils'

type FormFeedback =
	Partial<Omit<FormState, 'success' | 'values'>>

type RequireFeedback<T extends keyof FormFeedback = keyof FormFeedback> = {
	[K in T]: RequireSome<FormFeedback, K>
}[T]

type FormCondition<T> = RequireFeedback & {
	check: (data: T) => boolean | Promise<boolean>
}

interface FormActionConfig<T> {
	conditions?: FormCondition<T>[]
	names?: readonly string[]
	onSuccess?: (data: T, values: FormState['values']) => Partial<FormState>
}

export const action = <S extends z.ZodType>(schema: S, config?: FormActionConfig<z.infer<S>>) =>
	async (_prev: FormState, data: FormData): Promise<FormState> => {
		const names = config?.names,
			values = !!names?.length ? pickValues(data, names) : {},
			base = { errors: {}, values }

		try {
			const result = schema.safeParse(Object.fromEntries(data))

			if (!result.success)
				return { ...base, errors: showMessage(result.error) }

			await pause(ACTION_DELAY * 1000)

			for (const { check, ...feedback } of config?.conditions ?? [])
				if (await check(result.data)) return { ...base, ...feedback }

			const success = {
				success: true,
				...config?.onSuccess?.(result.data, values),
			}

			return { ...base, ...success }
		} catch {
			return { ...base, formError: BASE_ERROR }
		}
	}
