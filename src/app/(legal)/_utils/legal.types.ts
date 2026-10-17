import type {
	AddressData, BasePageData, CalendarDate,
	ContentData,
	PageDataItem, UserData,
} from '@/types/shared'

//	legal section

interface BaseLegalSection
	extends Pick<LegalSectionData, 'id' | 'body' | 'layout'> {}

type LegalSectionData =
	ContentData<LegalBodyOptions[], string, 'content' | 'default'>

type LegalBodyOptions =
	| { list: string[] }
	| { p: string }

interface LegalIntroSection {
	summary?: never
	title?: never
}

interface LegalContentSection {
	summary?: string
	title?: PageDataItem['title']
}

type LegalSectionTypes =
	| LegalIntroSection
	| LegalContentSection

export type LegalSection =
	& BaseLegalSection
	& LegalSectionTypes

//	changelog

interface ChangelogItem {
	id: string
	author?: UserData
	description: string
}

export interface VersionGroup {
	id: string
	changes?: ChangelogItem[]
	release_date: CalendarDate
	summary?: string
	version: `${number}`
}

//	page shape

export interface LegalPageData
	extends BasePageData {
	updated_date: CalendarDate
	effective_date: CalendarDate
	changelog: VersionGroup[]
	company_info: {
		legal_name: string
		address: AddressData
	}
	content: LegalSection[]
	footer?: {
		id: 'footer'
		heading: string
		body: string
		recipient: string
		contact_email: string
	}
}

export interface SharedLegalProps<K extends keyof LegalPageData> {
	data: LegalPageData[K]
}
