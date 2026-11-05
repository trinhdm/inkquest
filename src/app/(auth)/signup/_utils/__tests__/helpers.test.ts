import { describeMissing, getContact, maskContact } from '../helpers'

describe('getContact', () => {
	it('returns the email for the email method', () => {
		expect(getContact({ method: 'email', email: 'a@b.co', password: 'x' })).toBe('a@b.co')
	})

	it('returns the email for the magic method', () => {
		expect(getContact({ method: 'magic', email: 'a@b.co' })).toBe('a@b.co')
	})

	it('returns the tel for the phone method', () => {
		expect(getContact({ method: 'phone', tel: '+15551234567' })).toBe('+15551234567')
	})
})

describe('maskContact', () => {
	it('shows an email in full', () => {
		expect(maskContact({ method: 'email', contact: 'a@b.co' })).toBe('a@b.co')
		expect(maskContact({ method: 'magic', contact: 'a@b.co' })).toBe('a@b.co')
	})

	it('hides all but the last four digits of a phone number', () => {
		expect(maskContact({ method: 'phone', contact: '+15551234567' })).toBe('•••-4567')
	})
})

describe('describeMissing', () => {
	it('returns undefined when every rule is met', () => {
		expect(describeMissing('Hzqmxw1!')).toBeUndefined()
	})

	it('lists the missing rules, length first and "no sequences" last', () => {
		const message = describeMissing('abcd')

		expect(message).toMatch(/^Password must contain at least 6 characters, /)
		expect(message).toMatch(/, and no sequential characters\.$/)
		expect(message).toContain('an uppercase letter')
		expect(message).toContain('a number')
		expect(message).toContain('a symbol')
		expect(message).not.toContain('a lowercase letter')
	})

	it('names a single missing rule on its own', () => {
		expect(describeMissing('Hzqmxw1')).toBe('Password must contain a symbol.')
	})
})
