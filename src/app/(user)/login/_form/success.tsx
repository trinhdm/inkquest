import { useLoginCtx } from '../_utils/login.context'
import { AuthForm } from '../../_components/AuthForm'
import { Button } from '@/components/core/Button'
import { Field } from '@/components/form/Field'
import { Icon } from '@/components/core/Icon'

export const LoginSuccess = () => {
	const {
		formReply: { state },
		idx, waitUntilExpiry,
	} = useLoginCtx()

	const authFormProps = {
		form: { onSubmit: waitUntilExpiry },
		header: {
			title: 'Logged in.',
			eyebrow: 'Success!',
			description: `Welcome back — your feed is where you left it.`,
		},
		idx,
	} satisfies Omit<AuthForm.Props, 'children'>

	return (
		<AuthForm { ...authFormProps }>
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

			<Button animate="right" href="/community/feed">
				Go to your feed
				<Button.Section right><Icon type="arrow-right" /></Button.Section>
			</Button>
		</AuthForm>
	)
}

LoginSuccess.displayName = 'LoginSuccess'
