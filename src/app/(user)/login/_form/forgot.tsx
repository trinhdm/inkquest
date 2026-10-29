import { useLoginCtx } from '../_utils/login.context'
import { validateReset } from '../_utils/schema'
import { AuthForm } from '../../_components/AuthForm'
import { Button } from '@/components/core/Button'
import { Field } from '@/components/form/Field'
import { Icon } from '@/components/core/Icon'
import { PLACEHOLDER } from '@/lib/form'

export const LoginForgot = () => {
	const {
		destination, handleLoginFlow,
		idx, reset,
	} = useLoginCtx()

	const authFormProps = {
		form: { ...reset, validate: validateReset },
		header: {
			title: 'Forgot your password?',
			eyebrow: 'Reset password',
			description: `Enter the email on your account and we'll send a link to set a new one.`,
		},
		idx,
	} satisfies Omit<AuthForm.Props, 'children'>

	return (
		<AuthForm { ...authFormProps }>
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

			<Button.Group hasPriority={ false }>
				<Button
					animate="left"
					onClick={ () => handleLoginFlow('begin') }
					variant="ghost"
				>
					Back
					<Button.Section left><Icon type="arrow-left" /></Button.Section>
				</Button>
				<Button animate="right" loading={ reset.pending } type="submit">
					Send reset link
					<Button.Section right><Icon type="arrow-right" /></Button.Section>
				</Button>
			</Button.Group>
		</AuthForm>
	)
}

LoginForgot.displayName = 'LoginForgot'
