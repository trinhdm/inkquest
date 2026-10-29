import { useState } from 'react'
import { useSignupCtx } from '../_utils/signup.context'
import { SignupOptions } from './options'
import { Field } from '@/components/form/Field'
import { PasswordRules } from './password'
import { PLACEHOLDER_EMAIL, PLACEHOLDER_TEL } from '@/lib/form'

interface SignupFieldsProps {
	id: string
}

export const SignupFields = ({ id }: SignupFieldsProps) => {
	const {
		method,
		signup: { pending, state },
	} = useSignupCtx()

	const [password, setPassword] = useState('')
	const [lastState, setLastState] = useState(state)

	if (state !== lastState) {
		setLastState(state)
		setPassword('')
	}

	return (
		<>
			<input name="method" type="hidden" value={ method } />

			<Field
				required
				disabled={ pending }
				id={ `${id}-${method}` }
				label={ method === 'phone' ? 'Phone number' : 'Email' }
				caption={ <SignupOptions /> }
			>
				{ method === 'phone' ? (
					<Field.Input
						autoComplete="tel"
						defaultValue={ state.values.tel }
						key="tel"
						name="tel"
						placeholder={ PLACEHOLDER_TEL }
						type="tel"
					/>
				) : (
					<Field.Input
						autoComplete="email"
						defaultValue={ state.values.email }
						key="email"
						name="email"
						placeholder={ PLACEHOLDER_EMAIL }
						type="email"
					/>
				) }
			</Field>

			{ method === 'email' && (
				<>
					<input hidden autoComplete="username" name="username" ng-hide="true" type="text" />
					<Field
						required
						disabled={ pending }
						id={ `${id}-password` }
						label="Password"
						caption={ <PasswordRules value={ password } /> }
					>
						<Field.Input
							autoComplete="new-password"
							name="password"
							onChange={ event => setPassword(event.currentTarget.value) }
							placeholder="Your password"
							type="password"
						/>
					</Field>
				</>
			) }
		</>
	)
}

SignupFields.displayName = 'SignupFields'
