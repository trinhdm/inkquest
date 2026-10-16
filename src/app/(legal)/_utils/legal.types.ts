import type {
	AddressData, BasePageData, CalendarDate,
	PageDataItem, UserData,
} from '@/types/shared'

interface BaseLegalSection
	extends Pick<PageDataItem, 'id'> {
	body: LegalBodyOptions[]
}

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

type LegalBodyOptions =
	| { list: string[] }
	| { p: string }

export type LegalSection =
	& BaseLegalSection
	& LegalSectionTypes

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
		id: string
		heading: string
		body: string
		recipient: string
		contact_email: string
	}
}

export interface SharedLegalProps<K extends keyof LegalPageData> {
	data: LegalPageData[K]
}
