import { useState } from 'react'
import { useSignupCtx } from '../_utils/context'
import { Field } from '@/components/form/Field'
import { PasswordCriteria } from './PasswordCriteria'

export const PasswordField = () => {
	const {
		idx,
		method: { active: method },
		signup: { pending, state },
	} = useSignupCtx()

	const [lastState, setLastState] = useState(state)
	const [password, setPassword] = useState('')

	if (state !== lastState) {
		setLastState(state)
		setPassword('')
	}

	if (method !== 'email') return null

	return (
		<>
			<input hidden autoComplete="username" name="username" type="text" />

			<Field
				required
				disabled={ pending }
				id={ `${idx.field}-password` }
				label="Password"
				caption={ <PasswordCriteria value={ password } /> }
			>
				<Field.Input
					autoComplete="new-password"
					name="password"
					onChange={ event => setPassword(event.currentTarget.value) }
					placeholder="Your password"
					type="password"
					value={ password }
				/>
			</Field>
		</>
	)
}

PasswordField.displayName = 'PasswordField'
