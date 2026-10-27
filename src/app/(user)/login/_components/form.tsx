import { validateLogin } from '../_utils/schema'
import { Button } from '@/components/core/Button'
import { Field } from '@/components/form/Field'
import { Form } from '@/components/form/Form'
import { Icon } from '@/components/core/Icon'
import { PLACEHOLDER_EMAIL, type FormActionProps } from '@/lib/form'

const FORM_ID = 'login',
	FIELD_ID = `${FORM_ID}-field`

interface LoginFormProps
	extends FormActionProps {
	onForgotPass: () => void
	onMagicLink: () => void
	onSSO: (idp: 'Apple' | 'Google') => void
}

export const LoginForm = ({
	action,
	onForgotPass,
	onMagicLink,
	onSSO,
	pending,
	state,
}: LoginFormProps) => {
	const forgotPW = (
		<button onClick={ onForgotPass } type="button" data-link>Forgot password?</button>
	)

	return (
		<Form
			action={ action }
			id={ FORM_ID }
			pending={ pending }
			state={ state }
			validate={ validateLogin }
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
				caption={ forgotPW }
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
