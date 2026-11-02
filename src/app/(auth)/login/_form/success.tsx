import { useLoginCtx } from '../_utils/login.context'
import { AuthForm } from '../../_components/AuthForm'
import { Field } from '@/components/form/Field'

export const LoginSuccess = () => {
	const { destination, guardSubmit, idx } = useLoginCtx()

	return (
		<AuthForm idx={ idx } onSubmit={ guardSubmit }>
			<AuthForm.Header eyebrow="Success!" title="Logged in.">
				Welcome back — your feed is where you left it.
			</AuthForm.Header>

			{ !!destination && (
				<Field
					readonly
					id={ `${idx.field}-email` }
					label="Email"
					layout="inline"
				>
					<Field.Input
						defaultValue={ destination }
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
