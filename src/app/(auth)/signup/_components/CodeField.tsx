import { useState } from 'react'
import { useSignupCtx } from '../_utils/context'
import { Field } from '@/components/form/Field'

const CODE_LENGTH = 6

export const CodeField = () => {
	const {
		idx, method,
		verify: { pending, state },
	} = useSignupCtx()

	const [code, setCode] = useState(0)
	const [lastState, setLastState] = useState(state)

	if (state !== lastState) {
		setLastState(state)
		setCode(key => key++)
	}

	if (method.active === 'magic') return null

	return (
		<Field
			required
			disabled={ pending }
			id={ `${idx.field}-code` }
			// label="6-digit code"
		>
			<Field.Code
				key={ code }
				length={ CODE_LENGTH }
				name="code"
				placeholder="123456"
			/>
		</Field>
	)
}

CodeField.displayName = 'CodeField'
