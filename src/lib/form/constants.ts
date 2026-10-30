
export const PLACEHOLDER = {
	name: 'John Doe',
	email: 'name@example.com',
	tel: '(123) 456-7890',
} as const

export const MOCK_DATA = {
	failEmail: 'fail@example.com',
	failResend: 'resend-fail@example.com',
	failTel: '+10000000000',		//	what telRule makes of '(000) 000-0000'
	wrongCode: '000000',
	expiredCode: '111111',
} as const

export const ACTION_DELAY = 800
export const BASE_ERROR = 'Something went wrong. Try again.'
export const TIMER_DURATION = 30
