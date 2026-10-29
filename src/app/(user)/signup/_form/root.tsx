import { useSignupCtx, type SignupMethod } from '../_utils/signup.context'
import { validateSignup } from '../_utils/schema'
import { Button } from '@/components/core/Button'
import { Form } from '@/components/form/Form'
import { Icon } from '@/components/core/Icon'
import { Section } from '@/components/layout/Section'
import { SignupFields } from '../_components/fields'
import Link from 'next/link'

const SUBMIT_LABELS = {
	email:	'Create account',
	magic:	'Send magic link',
	phone:	'Send code',
} as const satisfies Record<SignupMethod, string>

export const SignupRoot = () => {
	const {
		idx, method, waiting,
		signup: { action, pending, state },
	} = useSignupCtx()

	return (
		<Section
			eyebrow="Create Account"
			id={ idx.section }
			layout="content-form"
			tabIndex={ -1 }
			title="Join Inkquest."
		>
			One account for finding artists, bidding on flash, and booking.

			<Form
				action={ action }
				id={ idx.form }
				pending={ pending }
				state={ state }
				validate={ validateSignup }
			>
				<SignupFields id={ idx.field } />

				<div className="form__ctas authentication">
					<Button
						fullWidth
						animate="right"
						className="authentication__email"
						disabled={ waiting }
						loading={ pending }
						name="method"
						type="submit"
						value={ method }
					>
						{ SUBMIT_LABELS[method] }
						<Button.Section right><Icon type="arrow-right" /></Button.Section>
					</Button>

					<div className="authentication__label" role="presentation">
						<span>or</span>
					</div>

					<Button.Group
						fullWidth
						className="authentication__sso"
						hasPriority={ false }
					>
						<Button
							fullWidth
							variant="outline"
						>
							<Button.Section><Icon type="google" /></Button.Section>
							Continue with Google
						</Button>
						<Button
							fullWidth
							variant="outline"
						>
							<Button.Section><Icon type="apple" /></Button.Section>
							Continue with Apple
						</Button>
					</Button.Group>

					<div className="authentication__note">
						<p>By creating an account, you confirm you&apos;re 18+ and agree to the <Link href="/terms" data-link>Terms</Link> and <Link href="/privacy-policy" data-link>Privacy Policy</Link>.</p>
					</div>
				</div>
			</Form>
		</Section>
	)
}

SignupRoot.displayName = 'SignupRoot'
