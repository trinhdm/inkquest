import { useLoginCtx } from '../_utils/login.context'
import { validateLoginForm } from '../_utils/schema'
import { AuthForm } from '../../_components/AuthForm'
import { Button } from '@/components/core/Button'
import { Field } from '@/components/form/Field'
import { PLACEHOLDER } from '@/lib/form'

export const LoginRoot = () => {
	const {
		handleLoginFlow,
		formReply: { pending, state },
		idx, login, magic, waiting,
	} = useLoginCtx()

	const ForgotPass = (
		<Button
			unstyled data-link
			onClick={ () => handleLoginFlow('forgot') }
		>
			Forgot password?
		</Button>
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
				<AuthForm.Submit fullWidth disabled={ waiting } loading={ login.pending }>
					Log In
				</AuthForm.Submit>

				<AuthForm.SSO
					onClick={ () => handleLoginFlow('success') }
					verb="Log In"
				/>

				<AuthForm.Note>
					<Button
						unstyled data-link
						data-intent="magic"
						disabled={ waiting }
						formAction={ magic.action }
						loading={ magic.pending }
						type="submit"
					>
						Email me a magic link instead
					</Button>
				</AuthForm.Note>
			</AuthForm.Footer>
		</AuthForm>
	)
}

LoginRoot.displayName = 'LoginRoot'
