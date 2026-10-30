import { useLoginCtx } from '../_utils/login.context'
import { AuthForm } from '../../_components/AuthForm'
import { Field } from '@/components/form/Field'

export const LoginSuccess = () => {
	const {
		formReply: { state },
		idx, waitUntilExpiry,
	} = useLoginCtx()

	return (
		<AuthForm idx={ idx } onSubmit={ waitUntilExpiry }>
			<AuthForm.Header eyebrow="Success!" title="Logged in.">
				Welcome back — your feed is where you left it.
			</AuthForm.Header>

			{ !!state.values.email && (
				<Field
					readonly
					id={ `${idx.field}-email` }
					label="Email"
					layout="inline"
				>
					<Field.Input
						defaultValue={ state.values.email }
						name="email"
						type="email"
					/>
				</Field>
			) }

			<AuthForm.Footer>
				<AuthForm.Continue href="/community/feed" label="Go to your feed" />
			</AuthForm.Footer>
		</AuthForm>
	)
}

LoginSuccess.displayName = 'LoginSuccess'
