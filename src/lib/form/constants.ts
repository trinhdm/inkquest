
//	forms

export const ACTION_DELAY = 800
export const TIMER_DURATION = 30

export const BASE_ERROR = 'Something went wrong. Try again.'

export const PLACEHOLDER = {
	name: 'John Doe',
	email: 'name@example.com',
	tel: '(123) 456-7890',
} as const


//	mock data

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
} as const

export const FAIL_CONTACT: string[] = [MOCK_INCORRECT.failEmail, MOCK_INCORRECT.failTel] as const
