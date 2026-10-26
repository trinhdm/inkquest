import type { ARTIST_TOPICS, CLIENT_TOPICS } from './schema'

export interface SupportTopic {
	caption: string
	label: string
	value: string
}

type ClientTopic = (typeof CLIENT_TOPICS)[number]
type ArtistTopic = (typeof ARTIST_TOPICS)[number]

export type ClientSupportTopic =
	SupportTopic & { value: ClientTopic }

export type ArtistSupportTopic =
	SupportTopic & { value: ArtistTopic }
