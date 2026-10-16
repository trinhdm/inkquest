import type { ReactNode } from 'react'
import type { Route } from 'next'
import type { Badge } from '@/components/core/Badge'
import type { Button } from '@/components/core/Button'
import type { CalendarDate } from './datetime'
import type { SOCIAL_BRANDS } from '@/utils/constants'

//	files

type FileType =
	'pdf' | 'zip'

export interface FileItem {
	size?: string
	type?: FileType
	url: Route
}


//	user

type UserRole =
	| 'Client'
	| 'Guest'
	| 'Staff Writer'
	| 'Studio'
	| 'Tattoo Artist'

export interface UserData {
	id: string
	name: string
	email: string
	role: UserRole
	avatar_url: string
	// joined_date: string
}

export interface AddressData {
	street_line1: string
	street_line2?: string
	city: string
	state: string
	zip: `${number}`
	country: string
}


//	nextjs page data

interface ButtonData
	extends Omit<Button.BaseProps, 'children' | 'href'> {
	id: string
	label: string
	url: Route
}

export interface ContentData<
	Body = unknown,
	Id extends string = string
> {
	id: Id
	eyebrow?: string
	heading?: string
	body?: Body
	buttons?: ButtonData[]
}

export interface BasePageData {
	id: string
	title: string
	description: string
	hero?: ContentData<string>
	content?: ContentData[]
	footer?: ContentData<string>
}

export interface PageDataItem {
	id: string
	title: string
	content?: ReactNode
}

export interface AssetItem
	extends PageDataItem {
	attachment?: FileItem
}

type Department =
	| 'artist relations'
	| 'community'
	| 'engineering'
	| 'trust & safety'

// const DEPT_CODES = {
// 	'artist relations': 'success',
// 	'community': 'info',
// 	'engineering': 'action',
// 	'trust & safety': 'info',
// } as const satisfies Record<Department, Button.Tone>

export interface JobItem
	extends PageDataItem {
	department: Omit<Badge.Props, 'children' | 'tone' | 'variant'> & {
		name: Department
		code: Badge.Tone | Extract<Badge.Variant, 'dark' | 'light'>
	}
	location: string
	publishDate?: CalendarDate
	role?: ReactNode[]
	url: Route
}

export interface PressItem
	extends Omit<PageDataItem, 'content'> {
	author: string
	publishDate?: CalendarDate
	url?: Route
}

export interface StaffItem {
	id: string
	name: string
	role?: ReactNode[]
}

export interface StatisticItem {
	id: string
	caption?: string
	icon?: ReactNode
	isHighlight?: boolean
	value: number | string
}


//	company / brand

export type SocialBrand =
	(typeof SOCIAL_BRANDS)[number]

// export interface StyleContext {
// 	classes?: Record<string, string>
// }
