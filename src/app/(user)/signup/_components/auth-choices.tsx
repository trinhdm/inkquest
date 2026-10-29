import { useSignupCtx } from '../_utils/signup.context'
import { Button } from '@/components/core/Button'
import { Icon } from '@/components/core/Icon'

export const AuthChoices = () => {
	const { handleSignupMethod, method } = useSignupCtx()

	return (
		<>
			{ method !== 'email' && (
				<Button
					unstyled
					className="authentication__option"
					onClick={ () => handleSignupMethod('email') }
				>
					<Button.Section><Icon size="14" type="email" /></Button.Section>
					<span data-link>Use email & password</span>
				</Button>
			) }
			{ method !== 'tel' && (
				<Button
					unstyled
					className="authentication__option"
					onClick={ () => handleSignupMethod('tel') }
				>
					<Button.Section><Icon size="14" type="phone" /></Button.Section>
					<span data-link>Use phone number</span>
				</Button>
			) }
			{ method !== 'magic' && (
				<Button
					unstyled
					className="authentication__option"
					onClick={ () => handleSignupMethod('magic') }
				>
					<Button.Section><Icon size="14" type="wand-sparkles" /></Button.Section>
					<span data-link>Email me a magic link</span>
				</Button>
			) }
		</>
	)
}

AuthChoices.displayName = 'AuthChoices'
