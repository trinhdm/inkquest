import { base } from '../../reference'

export interface OpacityTokens {
	disabled: string
}

export const getOpacityTokens = (): OpacityTokens => ({
	disabled: base.opacity('0.65'),
})
