// The login flow's screen and reply rules, with the three server actions mocked.
// A rejected action stands in for a request that never reached the server:
// `useForm` turns it into NETWORK_ERROR and keeps what was typed.
import { startTransition, type SubmitEvent } from 'react'
import { act, renderHook } from '@testing-library/react'
import { initFormState, NETWORK_ERROR } from '@/lib/form'
import { login, magicLogin, requestReset } from '../actions'
import { LOGIN_PAGE_DATA } from '../data'
import { useLoginFlow } from '../useLoginFlow'
import type { AccountValues } from '@/lib/auth/schema'
import type { FormResults, FormState } from '@/lib/form/types'

jest.mock('../actions', () => ({
	login: jest.fn(),
	magicLogin: jest.fn(),
	requestReset: jest.fn(),
}))

const EMAIL = 'ink@example.com',
	INCORRECT = 'Email or password is incorrect.',
	RESENT = `We sent another link to ${EMAIL}.`

const reply = (state: Partial<FormState> = {}): FormState =>
	({ errors: {}, values: { email: EMAIL }, ...state })

const offline = () => new TypeError('Failed to fetch')

const setup = (account: AccountValues | null = null) =>
	renderHook(() => useLoginFlow(LOGIN_PAGE_DATA, account))

//	useActionState only accepts a dispatch inside a transition
const submit = async (form: FormResults, entries: Record<string, string> = { email: EMAIL }) => {
	const data = new FormData()
	for (const [name, value] of Object.entries(entries)) data.set(name, value)
	await act(async () => startTransition(() => form.action(data)))
}

const submitEvent = () =>
	({ preventDefault: jest.fn() }) as unknown as SubmitEvent<HTMLFormElement>

beforeEach(() => jest.clearAllMocks())

describe('useLoginFlow', () => {
	it('starts on the log-in screen with the suggested email and no feedback', () => {
		const { result } = setup({ email: 'ada@example.com' })

		expect(result.current.screen).toBe('start')
		expect(result.current.content).toBe(LOGIN_PAGE_DATA.form.start)
		expect(result.current.destination).toBe('ada@example.com')
		expect(result.current.reply.state.formError).toBeUndefined()
	})

	// `Form` ties its client-side errors to the `errors` object by identity
	// (Form.tsx, `local.from === errors`); a new object each render would
	// wipe "Enter your password." one render after it appears
	it('hands hidden feedback the same errors object on every render', () => {
		const { result, rerender } = setup()
		const first = result.current.reply.state.errors

		rerender()

		expect(result.current.reply.state.errors).toBe(first)
		expect(first).toBe(initFormState.errors)
	})

	describe('password log in', () => {
		it('shows a wrong password error on the log-in screen', async () => {
			jest.mocked(login).mockResolvedValue(reply({ formError: INCORRECT }))
			const { result } = setup()

			await submit(result.current.login, { email: EMAIL, password: 'wrong' })

			expect(result.current.screen).toBe('start')
			expect(result.current.reply.state.formError).toBe(INCORRECT)
		})

		it('shows the finish screen with the email, and blocks further submits', async () => {
			jest.mocked(login).mockResolvedValue(reply({ success: true }))
			const { result } = setup()

			await submit(result.current.login, { email: EMAIL, password: 'secret' })

			expect(result.current.screen).toBe('finish')
			expect(result.current.content).toBe(LOGIN_PAGE_DATA.form.finish)
			expect(result.current.destination).toBe(EMAIL)

			const event = submitEvent()
			result.current.guardSubmit(event)
			expect(event.preventDefault).toHaveBeenCalled()
		})

		it('keeps the email but never the password when the request fails', async () => {
			jest.mocked(login).mockRejectedValue(offline())
			const { result } = setup()

			await submit(result.current.login, { email: EMAIL, password: 'secret' })

			expect(result.current.reply.state.formError).toBe(NETWORK_ERROR)
			expect(result.current.reply.state.values).toEqual({ email: EMAIL })
			expect(result.current.destination).toBe(EMAIL)
		})
	})

	describe('Google or Apple', () => {
		it('shows the finish screen without an email', () => {
			const { result } = setup({ email: 'ada@example.com' })

			act(() => result.current.navigate('finish'))

			expect(result.current.screen).toBe('finish')
			expect(result.current.destination).toBe('')
		})
	})

	describe('a failed reset request', () => {
		const failReset = async () => {
			jest.mocked(requestReset).mockRejectedValue(offline())
			const view = setup()

			act(() => view.result.current.navigate('forgot'))
			await submit(view.result.current.reset)

			return view
		}

		it('shows its error on "Forgot password?" and keeps the email', async () => {
			const { result } = await failReset()

			expect(result.current.screen).toBe('forgot')
			expect(result.current.reset.state.formError).toBe(NETWORK_ERROR)
			expect(result.current.destination).toBe(EMAIL)
		})

		it('leaves the log-in screen clean after Back, with the email kept', async () => {
			const { result } = await failReset()

			act(() => result.current.goBack())

			expect(result.current.screen).toBe('start')
			expect(result.current.reply.state.formError).toBeUndefined()
			expect(result.current.destination).toBe(EMAIL)
		})

		it('does not show the old error on a second visit to "Forgot password?"', async () => {
			const { result } = await failReset()

			act(() => result.current.goBack())
			act(() => result.current.navigate('forgot'))

			expect(result.current.screen).toBe('forgot')
			expect(result.current.reset.state.formError).toBeUndefined()
		})
	})

	describe('magic link', () => {
		const openMagic = async () => {
			jest.mocked(magicLogin).mockResolvedValueOnce(reply({ success: true }))
			const view = setup()

			await submit(view.result.current.magic)

			return view
		}

		it('opens the magic screen with the resend timer running', async () => {
			const { result } = await openMagic()

			expect(result.current.screen).toBe('magic')
			expect(result.current.waiting).toBe(true)
			expect(result.current.destination).toBe(EMAIL)
		})

		it('shows a failed resend on the magic screen only, not on log in after Back', async () => {
			const { result } = await openMagic()
			jest.mocked(magicLogin).mockRejectedValueOnce(offline())

			await submit(result.current.magic, { email: EMAIL, resent: 'true' })
			expect(result.current.magic.state.formError).toBe(NETWORK_ERROR)

			act(() => result.current.goBack())

			expect(result.current.screen).toBe('start')
			expect(result.current.reply.state.formError).toBeUndefined()
			expect(result.current.destination).toBe(EMAIL)
		})
	})

	describe('reset link sent', () => {
		const openReset = async () => {
			jest.mocked(requestReset).mockResolvedValueOnce(reply({ success: true }))
			const view = setup()

			act(() => view.result.current.navigate('forgot'))
			await submit(view.result.current.reset)

			return view
		}

		it('shows a successful resend message on the reset screen', async () => {
			const { result } = await openReset()
			jest.mocked(requestReset).mockResolvedValueOnce(reply({ success: true, message: RESENT }))

			expect(result.current.screen).toBe('reset')
			await submit(result.current.reset, { email: EMAIL, resent: 'true' })

			expect(result.current.reset.state.message).toBe(RESENT)
		})

		it('drops a failed resend error on "Wrong email?", keeping the email', async () => {
			const { result } = await openReset()
			jest.mocked(requestReset).mockRejectedValueOnce(offline())

			await submit(result.current.reset, { email: EMAIL, resent: 'true' })
			expect(result.current.reset.state.formError).toBe(NETWORK_ERROR)

			act(() => result.current.goBack())

			expect(result.current.screen).toBe('forgot')
			expect(result.current.reset.state.formError).toBeUndefined()
			expect(result.current.destination).toBe(EMAIL)
		})
	})
})
