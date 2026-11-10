import { useState } from 'react'
import { useOnReply } from '@/hooks/form/useOnReply'
import { useSignupCtx } from '../_utils/context'
import { Field } from '@/components/form/Field'
import { CODE_LENGTH } from '../_utils/data'

export const CodeField = () => {
	const {
		destination, idx,
		resend, verify,
	} = useSignupCtx()

	const [resetKey, setResetKey] = useState(0)

	const clear = () => setResetKey(key => key + 1)

	useOnReply(verify.state, clear)
	useOnReply(resend.state, state => {
		if (state.success) clear()
	})

	return (
		<Field
			hideLabel
			required
			disabled={ verify.pending }
			id={ `${idx.field}-code` }
			label={ `${CODE_LENGTH}-digit code sent to ${destination}` }
		>
			<Field.Code
				key={ resetKey }
				length={ CODE_LENGTH }
				name="code"
			/>
		</Field>
	)
}

CodeField.displayName = 'CodeField'
