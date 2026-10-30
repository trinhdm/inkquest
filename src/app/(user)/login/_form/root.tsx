import { useLoginCtx } from '../_utils/login.context'
import { validateLoginForm } from '../_utils/schema'
import { AuthForm } from '../../_components/AuthForm'
import { Field } from '@/components/form/Field'
import { PLACEHOLDER } from '@/lib/form'

export const LoginRoot = () => {
	const {
		idx, login, magic,
		navigate, waiting,
		reply: { pending, state },
	} = useLoginCtx()

	const ForgotPass = (
		<AuthForm.Back
			linkable
			label="Forgot password?"
			onClick={ () => navigate('forgot') }
		/>
	)

	return (
		<AuthForm
			action={ login.action }
			idx={ idx }
			pending={ pending }
			state={ state }
			validate={ validateLoginForm }
		>
			<AuthForm.Header eyebrow="Log In" title="Welcome back.">
				Pick up where you left off.
			</AuthForm.Header>

			<Field
				required
				disabled={ pending }
				id={ `${idx.field}-email` }
				label="Email"
			>
				<Field.Input
					autoComplete="email"
					defaultValue={ state.values.email }
					name="email"
					placeholder={ PLACEHOLDER.email }
					type="email"
				/>
			</Field>

			<Field
				required
				disabled={ pending }
				id={ `${idx.field}-password` }
				label="Password"
				caption={ ForgotPass }
			>
				<Field.Input
					autoComplete="current-password"
					name="password"
					placeholder="Your password"
					type="password"
				/>
			</Field>

			<AuthForm.Footer>
				<AuthForm.Submit
					fullWidth
					disabled={ waiting }
					label="Log In"
					loading={ login.pending }
				/>

				<AuthForm.SSO label="Log In" onClick={ () => navigate('success') } />

				<AuthForm.Note>
					<AuthForm.Submit
						linkable
						data-intent="magic"
						disabled={ waiting }
						formAction={ magic.action }
						label="Email me a magic link instead"
						loading={ magic.pending }
					/>
				</AuthForm.Note>
			</AuthForm.Footer>
		</AuthForm>
	)
}

LoginRoot.displayName = 'LoginRoot'
