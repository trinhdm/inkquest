import { useSignupCtx } from '../_utils/signup.context'
import { capitalize } from '@/utils/helpers'
import { Button } from '@/components/core/Button'
import { Field } from '@/components/form/Field'
import { Form } from '@/components/form/Form'
import { Icon } from '@/components/core/Icon'
import { Section } from '@/components/layout/Section'

const FORM_ID = 'signup-success',
	FIELD_ID = `${FORM_ID}-field`

export const SignupSuccess = () => {
	const {
		method, pageID, screen, to,
		waitUntilExpiry,
	} = useSignupCtx()

	return (
		<Section
			eyebrow="Success!"
			id={ `${pageID}-${screen}` }
			layout="content-form"
			tabIndex={ -1 }
			title="Account created."
		>
			You&apos;re in. A two-minute setup tunes your feed, search, and profile.

			<Form id={ FORM_ID } onSubmit={ waitUntilExpiry }>
				<Field
					readonly
					id={ `${FIELD_ID}-to` }
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
			</Form>
		</Section>
	)
}

SignupSuccess.displayName = 'SignupSuccess'
