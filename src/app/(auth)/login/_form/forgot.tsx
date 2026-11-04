import { useLoginCtx } from '../_utils/context'
import { validateReset } from '../_utils/schema'
import { AuthForm } from '../../_components/AuthForm'
import { Field } from '@/components/form/Field'
import { PLACEHOLDER } from '@/lib/form'

export const LoginForgot = () => {
	const {
		content, destination,
		goBack, idx, reset,
	} = useLoginCtx()

	return (
		<AuthForm { ...reset } idx={ idx } validate={ validateReset }>
			<AuthForm.Header eyebrow={ content.eyebrow } title={ content.heading }>
				{ content.body }
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
					placeholder={ PLACEHOLDER.email }
					type="email"
				/>
			</Field>

			<AuthForm.Footer>
				<AuthForm.Back disabled={ reset.pending } onClick={ goBack } />
				<AuthForm.Submit label="Send reset link" loading={ reset.pending } />
			</AuthForm.Footer>
		</AuthForm>
	)
}

LoginForgot.displayName = 'LoginForgot'
