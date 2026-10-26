import {
	useActionState, useState,
	type SubmitEvent,
} from 'react'

import {
	initFormState, showMessage,
	PLACEHOLDER_EMAIL, type FormState,
} from '@/lib/form'

import { login } from '../_utils/actions'
import { loginSchema } from '../_utils/schema'
import { Button } from '@/components/core/Button'
import { Field } from '@/components/form/Field'
import { Form } from '@/components/form/Form'
import { Icon } from '@/components/core/Icon'

const FORM_ID = 'login',
	FIELD_ID = `${FORM_ID}-field`

interface LoginFormProps {
	onForgotPass: () => void
	onMagicLink: () => void
	onSSO: (idp: 'Apple' | 'Google') => void
}

export const LoginForm = ({
	onForgotPass,
	onMagicLink,
	onSSO,
}: LoginFormProps) => {
	const [state, formAction, pending] = useActionState(login, initFormState)
	const [clientErrors, setClientErrors] = useState<FormState['errors'] | null>(null)

	const checkForm = (event: SubmitEvent<HTMLFormElement>) => {
		const result = loginSchema.safeParse(Object.fromEntries(new FormData(event.currentTarget)))
		if (result.success) return setClientErrors(null)

		event.preventDefault()
		setClientErrors(showMessage(result.error))
	}

	const failedCheck = clientErrors !== null

	return (
		<Form
			action={ formAction }
			errors={ clientErrors ?? state.errors }
			formError={ failedCheck ? undefined : state.formError }
			id={ FORM_ID }
			message={ failedCheck ? undefined : state.message }
			onSubmit={ checkForm }
			pending={ pending }
			pendingMessage="Logging in..."
		>
			<Field
				required
				id={ `${FIELD_ID}-email` }
				label="Email"
			>
				<Field.Input
					autoComplete="email"
					defaultValue={ state.values.email }
					name="email"
					placeholder={ PLACEHOLDER_EMAIL }
					type="email"
				/>
			</Field>

			<Field
				required
				id={ `${FIELD_ID}-password` }
				label="Password"
				caption={ <button onClick={ onForgotPass } type="button" data-link>Forgot password?</button> }
			>
				<Field.Input
					autoComplete="current-password"
					name="password"
					placeholder="Your password"
					type="password"
				/>
			</Field>

			<div className="form__ctas authentication">
				<Button
					fullWidth
					animate="right"
					className="authentication__email"
					loading={ pending }
					type="submit"
				>
					Log In
					<Button.Section right><Icon type="arrow-right" /></Button.Section>
				</Button>

				<div className="authentication__label" role="presentation">
					<span>or</span>
				</div>

				<Button.Group
					fullWidth
					className="authentication__sso"
					hasPriority={ false }
				>
					<Button
						fullWidth
						onClick={ () => onSSO('Google') }
						variant="outline"
					>
						<Button.Section><Icon type="google" /></Button.Section>
						Log In with Google
					</Button>
					<Button
						fullWidth
						onClick={ () => onSSO('Apple') }
						variant="outline"
					>
						<Button.Section><Icon type="apple" /></Button.Section>
						Log In with Apple
					</Button>
				</Button.Group>

				<div className="authentication__magic">
					<Button
						unstyled
						data-link
						onClick={ onMagicLink }
					>
						Email me a magic link instead
					</Button>
				</div>
			</div>
		</Form>
	)
}

LoginForm.displayName = 'LoginForm'
