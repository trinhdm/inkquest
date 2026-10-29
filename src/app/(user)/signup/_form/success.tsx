import { useSignupCtx } from '../_utils/signup.context'
import { capitalize } from '@/utils/helpers'
import { AuthForm } from '../../_components/AuthForm'
import { Button } from '@/components/core/Button'
import { Field } from '@/components/form/Field'
import { Icon } from '@/components/core/Icon'

export const SignupSuccess = () => {
	const {
		idx, method, to,
		waitUntilExpiry,
	} = useSignupCtx()

	const authFormProps = {
		form: { onSubmit: waitUntilExpiry },
		header: {
			title: 'Account created.',
			eyebrow: 'Success!',
			description: `You're in. A two-minute setup tunes your feed, search, and profile.`,
		},
		idx,
	} satisfies Omit<AuthForm.Props, 'children'>

	return (
		<AuthForm { ...authFormProps }>
			<Field
				readonly
				id={ `${idx.field}-to` }
				label={ capitalize(method) }
				layout="inline"
			>
				<Field.Input
					defaultValue={ to }
					name="email"
					type="email"
				/>
			</Field>

			<Button animate="right" href="/community/feed">
				Start setup
				<Button.Section right><Icon type="arrow-right" /></Button.Section>
			</Button>

			<div className="authentication__note">
				<p>Setup takes about two minutes — styles, location, and (for artists) your shop.</p>
			</div>
		</AuthForm>
	)
}

SignupSuccess.displayName = 'SignupSuccess'
