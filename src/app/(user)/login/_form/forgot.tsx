import { useLoginCtx } from '../_utils/login.context'
import { validateReset } from '../_utils/schema'
import { AuthForm } from '../../_components/AuthForm'
import { Field } from '@/components/form/Field'
import { PLACEHOLDER } from '@/lib/form'

export const LoginForgot = () => {
	const {
		destination, handleLoginFlow,
		idx, reset,
	} = useLoginCtx()

	return (
		<AuthForm { ...reset } idx={ idx } validate={ validateReset }>
			<AuthForm.Header eyebrow="Reset password" title="Forgot your password?">
				Enter the email on your account and we&apos;ll send a link to set a new one.
			</AuthForm.Header>

			<Field
				required
				disabled={ reset.pending }
				id={ `${idx.field}-email` }
				label="Email"
			>
				<Field.Input
					autoComplete="email"
					defaultValue={ destination }
					name="email"
					placeholder={  PLACEHOLDER.email }
					type="email"
				/>
			</Field>

			<AuthForm.Footer>
				<AuthForm.Back onClick={ () => handleLoginFlow('begin') } />
				<AuthForm.Submit label="Send reset link" loading={ reset.pending } />
			</AuthForm.Footer>
		</AuthForm>
	)
}

LoginForgot.displayName = 'LoginForgot'
