import { CookiesBase } from './_components'
import { COOKIES_DATA } from './cookies.data'
import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: COOKIES_DATA.title,
	description: COOKIES_DATA.description,
}

export default function Cookies() {
	return <CookiesBase />
}
