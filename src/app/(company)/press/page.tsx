import { PressBase } from './_components'
import type { Metadata } from 'next'
import './press.scss'

export const metadata: Metadata = {
	title: 'Press Kit',
	description: 'Everything you need for publishing.',
}

export default function Press() {
	return <PressBase />
}
