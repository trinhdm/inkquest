import { useLoginCtx } from '../_utils/login.context'
import { AuthForm } from '../../_components/AuthForm'
import { Button } from '@/components/core/Button'
import { Field } from '@/components/form/Field'
import { Icon } from '@/components/core/Icon'
import { ResendTimer } from '../../_components/ResendTimer'

export const LoginReset = () => {
	const {
		destination, endWait,
		handleLoginFlow, idx,
		reset, waiting,
		waitUntilExpiry,
	} = useLoginCtx()

	const authFormProps = {
		form: { ...reset, onSubmit: waitUntilExpiry },
		header: {
			title: 'Reset link sent',
			eyebrow: 'Check your inbox',
			description: <>If an account exists for { destination }, a link to reset your password is on its way. It expires in 30 minutes.</>,
		},
		idx,
	} satisfies Omit<AuthForm.Props, 'children'>

	return (
		<AuthForm { ...authFormProps }>
			<Field
				readonly
				id={ `${idx.field}-email` }
				label="Email"
				labelPosition="last"
				layout="inline"
				caption="Didn't arrive? Check spam, or resend below."
			>
				<Field.Input
					defaultValue={ destination }
					name="email"
					type="email"
				/>
			</Field>

			<Button
				animate="left"
				onClick={ () => handleLoginFlow('begin') }
			>
				Back to log in
				<Button.Section left><Icon type="arrow-left" /></Button.Section>
			</Button>

			<div className="authentication__note">
				<ResendTimer
					idx={ idx }
					loading={ reset.pending }
					name="resent"
					onComplete={ endWait }
					value="true"
					waiting={ waiting }
				/>

				<span data-dot>·</span>

				<Button
					unstyled data-link
					onClick={ () => handleLoginFlow('forgot') }
				>
					Wrong email?
				</Button>
			</div>
		</AuthForm>
	)
}

LoginReset.displayName = 'LoginReset'
