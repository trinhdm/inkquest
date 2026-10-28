import { useState } from 'react'
import { useSignupCtx } from '../_utils/signup.context'
import { validateSignupForm } from '../_utils/schema'
import { Button } from '@/components/core/Button'
import { Field } from '@/components/form/Field'
import { Form } from '@/components/form/Form'
import { Icon } from '@/components/core/Icon'
import { PasswordRules } from '../_components/password'
import { Section } from '@/components/layout/Section'
import { PLACEHOLDER_EMAIL } from '@/lib/form'
import Link from 'next/link'

const FORM_ID = 'signup',
	FIELD_ID = `${FORM_ID}-field`

export const SignupRoot = () => {
	const {
		handleSignupFlow,
		// formReply: { pending, state },
		magic, signup,
		pageID, screen,
	} = useSignupCtx()

	const [password, setPassword] = useState('')
	const [lastState, setLastState] = useState(signup.state)
​
	if (signup.state !== lastState) {
		setLastState(signup.state)
		setPassword('')
	}

	const AuthChoices = (
		<>
			<Button unstyled className="authentication__option">
				<Button.Section><Icon size="14" type="phone" /></Button.Section>
				<span data-link>Use phone number instead</span>
			</Button>
			{/* <Button unstyled className="authentication__option">
				<Button.Section><Icon size="14" type="wand-sparkles" /></Button.Section>
				<span data-link>Email me a magic link</span>
			</Button> */}
			<Button
				unstyled
				className="authentication__option"
				data-intent="magic"
				formAction={ magic.action }
				loading={ magic.pending }
				type="submit"
			>
				<Button.Section><Icon size="14" type="wand-sparkles" /></Button.Section>
				<span data-link>Email me a magic link</span>
			</Button>
		</>
	)

	return (
		<Section
			eyebrow="Create Account"
			id={ `${pageID}-${screen}` }
			layout="content-form"
			tabIndex={ -1 }
			title="Join Inkquest."
		>
			One account for finding artists, bidding on flash, and booking.

			<Form
				action={ signup.action }
				id={ FORM_ID }
				pending={ signup.pending }
				state={ signup.state }
				validate={ validateSignupForm }
			>
				<Field
					required
					disabled={ signup.pending }
					id={ `${FIELD_ID}-email` }
					label="Email"
					caption={ AuthChoices }
				>
					<Field.Input
						autoComplete="email"
						defaultValue={ signup.state.values.email }
						name="email"
						placeholder={ PLACEHOLDER_EMAIL }
						type="email"
					/>
				</Field>

				<Field
					required
					disabled={ signup.pending }
					id={ `${FIELD_ID}-password` }
					label="Password"
					caption={ <PasswordRules value={ password } /> }
				>
					<Field.Input
						autoComplete="new-password"
						name="password"
						onChange={ event => setPassword(event.currentTarget.value) }
						placeholder="Your password"
						type="password"
					/>
				</Field>

				<div className="form__ctas authentication">
					<Button
						fullWidth
						animate="right"
						className="authentication__email"
						loading={ signup.pending }
						type="submit"
					>
						Create account
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
							onClick={ () => handleSignupFlow('success') }
							variant="outline"
						>
							<Button.Section><Icon type="google" /></Button.Section>
							Continue with Google
						</Button>
						<Button
							fullWidth
							onClick={ () => handleSignupFlow('success') }
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
