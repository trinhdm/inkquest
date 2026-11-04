import { useActionState } from 'react'
import { unstable_rethrow } from 'next/navigation'
import { NETWORK_ERROR } from '@/lib/form'
import type { FormAction, FormResults, FormState } from '@/lib/form/types'

/**
 * Runs a form's server action through `useActionState`. A request that never
 * reaches the server rejects instead of replying, so it becomes a form error
 * here and the screen keeps what the user typed.
 */
export const useForm = (serverAction: FormAction, initialState: FormState): FormResults => {
	const safeAction: FormAction = async (prev, data) => {
		try {
			return await serverAction(prev, data)
		} catch (error) {
			unstable_rethrow(error)
			return { ...prev, errors: {}, formError: NETWORK_ERROR, message: undefined, success: false }
		}
	}

	const [state, action, pending] = useActionState(safeAction, initialState)
	return { action, pending, state }
}
