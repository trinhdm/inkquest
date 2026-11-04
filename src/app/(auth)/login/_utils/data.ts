import type { LoginPageData, LoginScreen } from './types'

//	login screens

export const SCREEN_BASE = 'start' as const satisfies LoginScreen

//	page data

export const LOGIN_PAGE_DATA: LoginPageData = {
	id: 'login',
	title: 'Login',
	description: 'Login to your Inkquest account.',
	form: {
		start: {
			id: 'hero',
			eyebrow: 'Log In',
			heading: 'Welcome back.',
			body: 'Pick up where you left off.',
		},
		magic: {
			id: 'magic-login',
			eyebrow: 'Magic Link',
			heading: 'Check your inbox',
		},
		forgot: {
			id: 'forgot-password',
			eyebrow: 'Reset password',
			heading: 'Forgot your password?',
			body: `Enter the email on your account and we'll send a link to set a new one.`,
		},
		reset: {
			id: 'reset-password',
			eyebrow: 'Check your inbox',
			heading: 'Reset link sent',
		},
		finish: {
			id: 'finish-login',
			eyebrow: 'Success!',
			heading: 'Logged in.',
			footer: `Welcome back — your feed is where you left it.`,
		},
	},
} as const
