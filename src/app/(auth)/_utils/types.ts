import type { ComponentPropsWithoutRef } from 'react'
import type { Button } from '@/components/core/Button'

export interface AuthFormIDs {
	field: string
	form: string
	section: string
	timer: string
}

//	`data-intent` + `formAction` is only needed when one form has
//	two or more submit buttons that do different jobs

export type NativeButtonProps =
	ComponentPropsWithoutRef<'button'>

export type RootActionButton =
	Pick<Button.Props, 'disabled' | 'fullWidth' | 'loading' | 'onClick'>

interface SubmitActionButton {
	'data-intent'?: never
	formAction?: never
	name?: never
	value?: never
}
interface FormActionButton {
	'data-intent': string
	formAction: NativeButtonProps['formAction']
	name?: never
	value?: never
}

interface ServerActionButton {
	'data-intent'?: never
	formAction?: never
	name: NativeButtonProps['name']
	value: NativeButtonProps['value']
}

type AuthButtonTypes =
	| SubmitActionButton
	| FormActionButton
	| ServerActionButton

export type AuthSubmitButton =
	& RootActionButton
	& AuthButtonTypes
