import { useState } from 'react'
import type { FormState } from '@/lib/form/types'

//	runs callback once for each new reply, during render
//	`onReply` is used to set the calling component's own state only
export const useOnReply = (
	state: FormState,
	onReply: (state: FormState) => void,
) => {
	const [last, setLast] = useState(state)

	if (state !== last) {
		setLast(state)
		onReply(state)
	}
}
