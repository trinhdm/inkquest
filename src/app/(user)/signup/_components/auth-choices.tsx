import { useSignupCtx, type SignupMethod } from '../_utils/signup.context'
import { Button } from '@/components/core/Button'
import { Icon } from '@/components/core/Icon'

interface AuthOption {
	name: SignupMethod
	icon: Icon.Props['type']
	label: string
}

const AUTH_OPTIONS: AuthOption[] = [
	{
		name: 'email',
		icon: 'email',
		label: 'Use email & password',
	},
	{
		name: 'magic',
		icon: 'wand-sparkles',
		label: 'Email me a magic link',
	},
	{
		name: 'tel',
		icon: 'phone',
		label: 'Use phone number',
	},
]

export const AuthChoices = () => {
	const { handleSignupMethod, method, signup } = useSignupCtx()

	return AUTH_OPTIONS.map(({ icon, label, name }) => (
		method !== name && (
			<Button
				unstyled
				className="authentication__option"
				disabled={ signup.pending }
				key={ `${name}-option` }
				onClick={ () => handleSignupMethod(name) }
			>
				<Button.Section><Icon size="14" type={ icon } /></Button.Section>
				<span data-link>{ label }</span>
			</Button>
		)
	))
}

AuthChoices.displayName = 'AuthChoices'
