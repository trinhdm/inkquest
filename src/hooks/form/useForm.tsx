import { useActionState } from 'react'
import type { FormResults } from '@/lib/form'

export const useForm = <T,>(
	serverAction: (_prev: T, data: FormData) => Promise<T>,
	initialState: Awaited<T>,
): FormResults<T> => {
	const [state, action, pending] = useActionState<T, FormData>(serverAction, initialState)
	return { action, pending, state }
}
