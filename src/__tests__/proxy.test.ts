/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { proxy } from '../proxy'

const URL_BASE = 'http://localhost:3000'

const session = JSON.stringify({ email: 'ink@example.com', name: 'Ink' })

const request = (method: string, cookie?: string, path = '/signup') =>
	new NextRequest(`${URL_BASE}${path}`, {
		method,
		headers: cookie === undefined ? {} : { cookie: `inkq_session=${encodeURIComponent(cookie)}` },
	})

const isPassThrough = (response: Response) =>
	response.headers.get('x-middleware-next') === '1' && !response.headers.has('location')

describe('proxy', () => {
	it('sends a signed-in GET to /signup home', () => {
		const response = proxy(request('GET', session))

		expect(response.status).toBeGreaterThanOrEqual(300)
		expect(response.status).toBeLessThan(400)
		expect(new URL(response.headers.get('location') as string).pathname).toBe('/')
	})

	it('sends a signed-in GET to /login home', () => {
		const response = proxy(request('GET', session, '/login'))

		expect(new URL(response.headers.get('location') as string).pathname).toBe('/')
	})

	it('lets a signed-in POST through so the action can show its success screen', () => {
		expect(isPassThrough(proxy(request('POST', session)))).toBe(true)
	})

	it('lets a visitor without a cookie through', () => {
		expect(isPassThrough(proxy(request('GET')))).toBe(true)
	})

	it('lets a junk cookie through', () => {
		expect(isPassThrough(proxy(request('GET', 'not json')))).toBe(true)
	})

	it('lets a cookie with an invalid account through', () => {
		expect(isPassThrough(proxy(request('GET', JSON.stringify({ email: 'nope' }))))).toBe(true)
	})
})
