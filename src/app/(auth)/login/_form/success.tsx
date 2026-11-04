import { useLoginCtx } from '../_utils/context'
import { AuthForm } from '../../_components/AuthForm'
import { Field } from '@/components/form/Field'
import { NavRoutes } from '@/utils/navigation'

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
				<AuthForm.Continue href={ NavRoutes.COMMUNITY_FEED } label="Go to your feed" />
			</AuthForm.Footer>
		</AuthForm>
	)
}

LoginSuccess.displayName = 'LoginSuccess'
