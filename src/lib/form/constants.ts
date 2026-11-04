
//	timing (in seconds)

export const ACTION_DELAY = 800
export const CODE_EXPIRY = 900
export const TIMER_DURATION = 30

//	form errors

export const BASE_ERROR = 'Something went wrong. Try again.'
export const NETWORK_ERROR = 'Couldn\'t reach Inkquest. Check your connection and try again.'

//	mock data

export const PLACEHOLDER = {
	name: 'John Doe',
	email: 'name@example.com',
	tel: '(123) 456-7890',
} as const

//	there are no sessions yet, so the signed-in account is hard-coded
export const MOCK_ACCOUNT = {
	email: 'doreen.trinh@gmail.com',
	name: 'Doreen Trinh',
}

export const MOCK_INCORRECT = {
	failEmail: 'fail@example.com',
	failResend: 'resend-fail@example.com',
	failTel: '+10000000000',		//	what telRule makes of '(000) 000-0000'
	expiredCode: '111111',
	wrongCode: '000000',
	wrongPassword: 'wrong',
} as const

export const FAIL_CONTACT: string[] = [MOCK_INCORRECT.failEmail, MOCK_INCORRECT.failTel] as const
