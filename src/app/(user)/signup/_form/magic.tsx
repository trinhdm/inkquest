import { useSignupCtx } from '../_utils/signup.context'
import { AuthForm } from '../../_components/AuthForm'
import { Button } from '@/components/core/Button'
import { Field } from '@/components/form/Field'
import { Icon } from '@/components/core/Icon'
import { ResendTimer } from '../../_components/ResendTimer'

export const SignupMagic = () => {
	const {
		endWait, goBack,
		idx, method, reply, resend,
		resent, to, waiting,
		waitUntilExpiry,
	} = useSignupCtx()

	const authFormProps = {
		form: {
			action: resend.action,
			onSubmit: waitUntilExpiry,
			pending: resend.pending,
			state: {
				...reply.state,
				message: resent && waiting ? `We sent another link to ${to}.` : undefined,
			},
		},
		header: {
			title: 'Check your inbox',
			eyebrow: 'Magic Link',
			description: <>We emailed a sign-in link to { to }. It expires in 15 minutes.</>,
		},
		idx,
	} satisfies Omit<AuthForm.Props, 'children'>

	return (
		<AuthForm { ...authFormProps }>
			<input name="method" type="hidden" value={ method } />
			<input name="to" type="hidden" value={ to } />

			<Field
				readonly
				id={ `${idx.field}-email` }
				label="Email"
				labelPosition="last"
				layout="inline"
				caption="Didn't arrive? Check spam, or resend below."
			>
				<Field.Input
					defaultValue={ to }
					name="email"
					type="email"
				/>
			</Field>

			<Button.Group hasPriority={ false }>
				<Button
					animate="left"
					onClick={ goBack }
					variant="ghost"
				>
					Back
					<Button.Section left><Icon type="arrow-left" /></Button.Section>
				</Button>

				<ResendTimer
					idx={ idx }
					onComplete={ endWait }
					loading={ resend.pending }
					waiting={ waiting }
				/>
			</Button.Group>
		</AuthForm>
	)
}

SignupMagic.displayName = 'SignupMagic'
