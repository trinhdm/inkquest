
export const PLACEHOLDER_EMAIL = 'name@example.com'
export const PLACEHOLDER_TEL = '(123) 456-7890'

export const ACTION_DELAY = 800
export const BASE_ERROR = 'Something went wrong. Try again.'

export const MOCK_DATA = {
	failEmail: 'fail@example.com',
	failResend: 'resend-fail@example.com',
	failTel: '+10000000000',		//	what telRule makes of '(000) 000-0000'
	wrongCode: '000000',
	expiredCode: '111111',
} as const
