import { parseAccount } from '../schema'

describe('parseAccount', () => {
	it('returns the account for valid JSON', () => {
		expect(parseAccount(JSON.stringify({ email: 'a@b.co', name: 'Ada' })))
			.toEqual({ email: 'a@b.co', name: 'Ada' })
	})

	it('accepts an account without a name', () => {
		expect(parseAccount(JSON.stringify({ email: 'a@b.co' }))).toEqual({ email: 'a@b.co' })
	})

	it('returns null for undefined', () => {
		expect(parseAccount(undefined)).toBeNull()
	})

	it('returns null for an empty string', () => {
		expect(parseAccount('')).toBeNull()
	})

	it('returns null for bad JSON instead of throwing', () => {
		expect(parseAccount('{not json')).toBeNull()
	})

	it('returns null for valid JSON that fails the schema', () => {
		expect(parseAccount(JSON.stringify({ email: 'not-an-email' }))).toBeNull()
		expect(parseAccount(JSON.stringify({ name: 'No email' }))).toBeNull()
		expect(parseAccount(JSON.stringify('a@b.co'))).toBeNull()
	})

	it('returns null when the name is over 100 characters', () => {
		expect(parseAccount(JSON.stringify({ email: 'a@b.co', name: 'x'.repeat(101) }))).toBeNull()
	})
})
