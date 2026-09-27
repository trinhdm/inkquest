'use client'

import Link from 'next/link'
import { Button, Icon } from '@/components/core'
import { Grid, Group, Section } from '@/components/layout'
import { Statistic, Table } from '@/components/data'
import type { ReactNode } from 'react'
import type { Route } from 'next'
import type { CalendarDate, FileItem } from '@/types/shared'

interface StatisticItem {
	id: string
	caption?: string
	icon?: ReactNode
	isHighlight?: boolean
	value: number | string
}

const COMPANY_STATS: StatisticItem[] = [
	{
		id: 'artist-count',
		caption: 'Founded',
		value: '2024, Brooklyn NY',
	},
	{
		id: 'cities-reached',
		caption: 'Artists',
		value: '12,400+ across 38 cities',
	},
	{
		id: 'payout-total',
		caption: 'Paid to artists',
		value: '$9.2M to date',
	},
	{
		id: 'session-rating',
		caption: 'Model',
		value: 'Clients bid; artists set the floor',
	},
]

interface AssetItem {
	id: string
	title: string
	content?: ReactNode
	attachment?: FileItem
}

const ASSETS_LIST: AssetItem[] = [
	{
		id: 'logo-pack',
		title: 'Logo pack',
		content: 'SVG + PNG, dark and light lockups',
		attachment: {
			url: 'https://react.dev/',
			size: '1.2 mb',
			type: 'zip',
		},
	},
	{
		id: 'product-screenshots',
		title: 'Product screenshots',
		content: 'Discover, marketplace, bidding flow',
		attachment: {
			url: '/',
			size: '8.4 mb',
			type: 'zip',
		},
	},
	{
		id: 'founder-photos',
		title: 'Founder photos',
		content: 'Ren Okafor & June Park, print-res',
		attachment: {
			url: 'https://www.npmjs.com/',
			size: '14 mb',
			type: 'zip',
		},
	},
	{
		id: 'brand-guidelines',
		title: 'Brand guidelines',
		content: 'Color, type, and usage rules',
		attachment: {
			url: 'https://claude.ai/',
			size: '2.1 mb',
			type: 'pdf',
		},
	},
]

interface PressItem {
	id: string
	author: string
	title: string
	publishDate?: CalendarDate
	url?: Route<string>
}

const PRESS_HISTORY: PressItem[] = [
	{
		id: 'verge-article',
		author: 'The Verge',
		title: 'How Inkquest is rewiring the way tattoo artists get booked',
		url: '/',
		publishDate: {
			month: 'March',
			year: 2026,
		},
	},
	{
		id: 'fast-company-article',
		author: 'Fast Company',
		title: 'The startup letting tattoo artists set their own floor price',
		url: 'https://react.dev/',
		publishDate: {
			month: 'January',
			year: 2026,
		},
	},
	{
		id: 'techcrunch-article',
		author: 'TechCrunch',
		title: 'Inkquest raises to expand its artist-first marketplace',
		url: '/about',
		publishDate: {
			month: 'September',
			year: 2025,
		},
	},
	{
		id: 'hyperallergic-article',
		author: 'Hyperallergic',
		title: 'Inside the app turning flash sheets into live auctions',
		url: 'https://www.npmjs.com/',
		publishDate: {
			month: 'July',
			year: 2025,
		},
	},
	{
		id: 'wired-article',
		author: 'Wired',
		title: 'Bidding for body art: the new economics of tattooing',
		url: '/careers',
		publishDate: {
			month: 'May',
			year: 2025,
		},
	},
]

export default function Press() {
	const pageID = 'press'

	return (
		<>
			<Section
				eyebrow="Press kit"
				id={ `${pageID}-hero` }
				layout="hero"
				title="Writing about us?"
			>
				<>Everything you need — boilerplate, facts, logos, and photography. For interviews and anything not covered here, email <a href="press@inkquest.com" data-action>press@inkquest.com</a>.</>

				<Section.Button>Download full kit (ZIP)</Section.Button>
			</Section>

			<Section
				eyebrow="Our story"
				id={ `${pageID}-about` }
				layout="split"
				title="About Inkquest."
			>
				Inkquest is a marketplace and community connecting tattoo artists with clients. Clients search by style and distance, bid on flash designs and open booking slots, and book directly — with the artist setting the floor price on every piece. Founded in Brooklyn in 2024, Inkquest hosts more than 12,400 verified artists across 38 cities and has paid over $9.2M directly to artists.

				<Section.Button variant="outline">Copy boilerplate</Section.Button>
			</Section>

			<Section id={ `${pageID}-stats` } layout="blocks">
				<Statistic.Group animated={ false } order="ascend" size="sm">
					{ COMPANY_STATS.map(({ isHighlight, ...stat }) => (
						<Statistic highlight={ isHighlight } { ...stat } />
					)) }
				</Statistic.Group>
			</Section>

			<Section
				eyebrow="Assets"
				id={ `${pageID}-assets` }
				title="Logos & photography."
			>
				<Grid columns={ 2 }>
					{ ASSETS_LIST.map(({
						attachment,
						content,
						id,
						title,
					}) => {
						const details: string[] = []
						let href: Route<string> | undefined

						if (attachment) {
							const { url, ...file } = attachment
							if (!!url) href = url

							for (const key of Object.keys(file) as (keyof typeof file)[])
								if (!!file[key]) details.push(file[key])
						}

						const hasDownload = !!href?.length

						return (
							<div key={ `asset-${id}` } className="inkq-item--block">
								<span className="inkq-rail" />
								<Group orientation="horizontal">
									<Group.Item>
										<h3 className="inkq-h4">{ title }</h3>
										<p>{ content }</p>
										{ !!details.length && (
											<span className="inkq-eyebrow">
												{ details.join(' · ') }
											</span>
										) }
									</Group.Item>
									{ hasDownload && (
										<Group.Item>
											<Button href={ href } size="sm" variant="outline">
												Download
											</Button>
										</Group.Item>
									) }
								</Group>
							</div>
						)
					}) }
				</Grid>
			</Section>

			<Section
				eyebrow="Mentions"
				id={ `${pageID}-history` }
				title="Past press mentions."
			>
				<Table>
					{ PRESS_HISTORY.map(({
						author,
						id,
						publishDate,
						title,
						url,
					}) => {
						const headline = `"${title.replace(/^['"]|['"]$/g, '')}"`,
							calendarDate: string[] = []

						if (publishDate) {
							const parts = Object.keys(publishDate) as (keyof typeof publishDate)[]
							for (const key of parts) {
								const value = String(publishDate[key])
								if (!!value.length) {
									const target = { month: value.slice(0, 3), year: value }[key]
									calendarDate.push(target)
								}
							}
						}

						return (
							<Table.Row key={ `press-${id}` }>
								<Table.Cell><strong>{ author }</strong></Table.Cell>
								<Table.Cell className="inkq-prose">
									<span>
										{ !!url ? <Link href={ url }>{ headline }</Link> : headline }
									</span>
								</Table.Cell>
								{ !!calendarDate.length && (
									<Table.Cell>
										<span className="inkq-eyebrow">
											{ calendarDate.join(' ') }
										</span>
									</Table.Cell>
								) }
							</Table.Row>
						)
					}) }
				</Table>
			</Section>
		</>
	)
}
