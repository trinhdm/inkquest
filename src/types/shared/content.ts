import type { ReactNode } from 'react'
import type { Route } from 'next'
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

interface ContentData  {
	eyebrow?: string
	heading: string
	body?: string
	buttons?: {
		label: string
		url: string
	}[]
}

export interface BasePageData {
	id: string
	title: string
	hero?: ContentData
	footer?: ContentData
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

export interface JobItem
	extends PageDataItem {
	department: | 'artist relations' | 'community' | 'engineering' | 'trust & safety'
	location: string[]
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
