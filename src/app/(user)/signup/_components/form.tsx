import Link from 'next/link'
import { validateSignup } from '../_utils/schema'
import { Button } from '@/components/core/Button'
import { Field } from '@/components/form/Field'
import { Form } from '@/components/form/Form'
import { Icon } from '@/components/core/Icon'
import { PLACEHOLDER_EMAIL, type FormActionProps } from '@/lib/form'

const FORM_ID = 'signup',
	FIELD_ID = `${FORM_ID}-field`

interface SignupFormProps
	extends FormActionProps {
	onSSO: (idp: 'Apple' | 'Google') => void
}

export const SignupForm = ({
	action,
	onSSO,
	pending,
	state,
}: SignupFormProps) => {
	return (
		<Form
			action={ action }
			id={ FORM_ID }
			pending={ pending }
			state={ state }
			validate={ validateSignup }
		>
			<Field
				required
				id={ `${FIELD_ID}-email` }
				label="Email"
			>
				<Field.Input
					autoComplete="email"
					defaultValue={ state.values.email }
					name="email"
					placeholder={ PLACEHOLDER_EMAIL }
					type="email"
				/>
			</Field>

			<Field
				required
				id={ `${FIELD_ID}-password` }
				label="Password"
			>
				<Field.Input
					autoComplete="new-password"
					name="password"
					placeholder="Your password"
					type="password"
				/>
			</Field>

			<div className="password">
				<div className="password__strength">
					<ul className="password__requirements" data-unlist>
						<li className="password__check">
							<span className="password__status" />
							<span>8+ characters</span>
						</li>
						<li className="password__check">
							<span className="password__status" />
							<span>Upper & lower case</span>
						</li>
						<li className="password__check">
							<span className="password__status" />
							<span>A number</span>
						</li>
						<li className="password__check">
							<span className="password__status" />
							<span>A symbol</span>
						</li>
					</ul>
				</div>
			</div>

			<div className="form__ctas authentication">
				<Button
					fullWidth
					animate="right"
					className="authentication__email"
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
						onClick={ () => onSSO('Google') }
						variant="outline"
					>
						<Button.Section><Icon type="google" /></Button.Section>
						Continue with Google
					</Button>
					<Button
						fullWidth
						onClick={ () => onSSO('Apple') }
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
	)
}

SignupForm.displayName = 'SignupForm'
