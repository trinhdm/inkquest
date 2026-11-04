import type { ReactNode } from 'react'
import type { Route } from 'next'
import type { Badge } from '@/components/core/Badge'
import type { Button } from '@/components/core/Button'
import type { CalendarDate } from './datetime'
import type { Section } from '@/components/layout/Section'
import type { SocialBrands } from '@/utils/constants'

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

interface ButtonData {
	id: string
	label: string
	url: Route
	props?: Omit<Button.BaseProps, 'children' | 'href'>
}

type _Layout =
	Section.Props['layout']

type _LayoutGroup<
	S extends string,
	L extends NonNullable<_Layout>,
	T = string
> =
	ContentData<T, S, Extract<_Layout, `${L}${string}`>>

export interface ContentData<
	Body = unknown,
	Id extends string = string,
	L extends _Layout = _Layout,
> {
	id: Id
	layout?: L
	eyebrow?: Section.Props['eyebrow']
	heading?: Section.Props['title']
	body?: Body
	buttons?: ButtonData[]
}

export interface BasePageData {
	id: string
	title: string
	description: string
	hero?: _LayoutGroup<'hero', 'hero'>
	content?: ContentData[]
	footer?: _LayoutGroup<'footer', 'banner'>
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
	Lowercase<`${SocialBrands}`>
