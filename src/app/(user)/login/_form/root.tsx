import { useLoginCtx } from '../_utils/login.context'
import { validateLoginForm } from '../_utils/schema'
import { AuthFooter } from '../../_components/AuthFooter'
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

	const authFormProps = {
		form: {
			action: login.action,
			pending,
			state,
			validate: validateLoginForm,
		},
		header: {
			title: 'Welcome back.',
			eyebrow: 'Log In',
			description: 'Pick up where you left off.',
		},
		idx,
	} satisfies Omit<AuthForm.Props, 'children'>

	const authFooterProps = {
		button: {
			disabled: waiting,
			label: 'Log In',
			loading: login.pending,
		},
		sso: {
			onClick: () => handleLoginFlow('success'),
			verb: 'Log In',
		},
	} satisfies Omit<AuthFooter.Props, 'children'>

	return (
		<AuthForm { ...authFormProps }>
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

			<AuthFooter { ...authFooterProps }>
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
			</AuthFooter>
		</AuthForm>
	)
}

LoginRoot.displayName = 'LoginRoot'
