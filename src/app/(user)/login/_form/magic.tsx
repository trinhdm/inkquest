import { useLoginCtx } from '../_utils/login.context'
import { AuthForm } from '../../_components/AuthForm'
import { Button } from '@/components/core/Button'
import { Field } from '@/components/form/Field'
import { Icon } from '@/components/core/Icon'
import { ResendTimer } from '../../_components/ResendTimer'

export const LoginMagic = () => {
	const {
		destination, endWait,
		handleLoginFlow, idx,
		magic, waiting,
		waitUntilExpiry,
	} = useLoginCtx()

	const authFormProps = {
		form: { ...magic, onSubmit: waitUntilExpiry },
		header: {
			title: 'Check your inbox',
			eyebrow: 'Magic Link',
			description: <>We emailed a sign-in link to { destination }. It expires in 15 minutes.</>,
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

			<Button.Group hasPriority={ false }>
				<Button
					animate="left"
					onClick={ () => handleLoginFlow('begin') }
					variant="ghost"
				>
					Back
					<Button.Section left><Icon type="arrow-left" /></Button.Section>
				</Button>

				<ResendTimer
					idx={ idx }
					loading={ magic.pending }
					name="resent"
					onComplete={ endWait }
					value="true"
					waiting={ waiting }
				/>
			</Button.Group>
		</AuthForm>
	)
}

LoginMagic.displayName = 'LoginMagic'
