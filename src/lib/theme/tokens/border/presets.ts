import { alias } from '../../reference'

interface BorderProperties {
	color: string
	style: string
	width: string
}

export interface BorderPresetTokens {
	subtle: BorderProperties
}

export const getBorderPresetTokens = (): BorderPresetTokens => {
	const borderSharedProps = {
		style: 'solid',
		width: '1px',
		// width: alias.borderWidth('hairline'),
	}

	return {
		subtle: {
			...borderSharedProps,
			color: alias.border(),
		},
	}
}
