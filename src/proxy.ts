import { NextResponse, type NextRequest } from 'next/server'
import { parseAccount } from '@/lib/auth/schema'
import { NavRoutes } from '@/utils/navigation'
import { SESSION_COOKIE } from '@/lib/auth/constants'

/** Sends logged-in visitors away from /login and /signup. Only fresh GET requests reach it, so the re-render after a login or signup action still shows its success screen. */
export function proxy(request: NextRequest) {
	const user = parseAccount(request.cookies.get(SESSION_COOKIE)?.value)

	if (request.method !== 'GET' || !user) return NextResponse.next()
	return NextResponse.redirect(new URL(NavRoutes.HOME, request.url))
}

export const config = {
	matcher: ['/login', '/signup'],
}
