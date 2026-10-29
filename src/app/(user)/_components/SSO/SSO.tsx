import { capitalize } from '@/utils/helpers'
import { Button } from '@/components/core/Button'
import { Icon } from '@/components/core/Icon'

interface SSOProps
	extends Pick<Button.Props, 'disabled' | 'loading' | 'onClick'> {
	brand: Icon.Social.Props['type']
	verb: string
}

export const SSO = ({
	brand,
	verb,
	...props
}: SSOProps) => {
	const action = capitalize(verb),
		name = capitalize(brand)

	return (
		<Button
			{ ...props }
			fullWidth
			variant="outline"
		>
			<Button.Section><Icon type={ brand } /></Button.Section>
			{ action } with { name }
		</Button>
	)
}

SSO.displayName = 'Button'

export declare namespace SSO {
	export type Props = SSOProps
}
