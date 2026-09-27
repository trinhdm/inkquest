'use client'

import { Accordion, Quote, Statistic, Timeline } from '@/components/data'
import { Card, Icon } from '@/components/core'
import { Grid, Section } from '@/components/layout'
import type { ReactNode } from 'react'
import type { Route } from 'next'
import type { CalendarDate } from '@/types/shared'

interface ComponentItem {
	id: string
	title: string
	content: ReactNode
}

const STORY_TIMELINE: ComponentItem[] = [
	{
		id: 'idea-2023',
		title: '2023',
		content: 'A flash sheet taped to a studio wall sells out in an afternoon — to people bidding in the comments of a group chat. The idea writes itself.',
	},
	{
		id: 'launch-2024',
		title: '2024',
		content: 'Inkquest launches in Brooklyn with 61 artists. One rule from day one: the artist sets the floor.',
	},
	{
		id: 'market-2025',
		title: '2025',
		content: 'The marketplace opens — flash designs and open slots, bid in real time. First $1M paid out to artists.',
	},
	{
		id: 'progress-2026',
		title: '2026',
		content: '38 cities, 12,000+ artists. Still black. Still red. Still the work first.',
	},
]

interface StatisticItem {
	id: string
	caption?: string
	icon?: ReactNode
	isHighlight?: boolean
	value: number | string
}

const PLATFORM_STATS: StatisticItem[] = [
	{
		id: 'artist-count',
		caption: 'Artists on platform',
		value: '12,400+',
	},
	{
		id: 'cities-reached',
		caption: 'Cities',
		value: 38,
	},
	{
		id: 'payout-total',
		caption: 'Paid to artists',
		isHighlight: true,
		value: '$9.2M',
	},
	{
		id: 'session-rating',
		caption: 'Avg session rating',
		icon: <Icon filled type="rating" />,
		value: 4.8,
	},
]

const COMPANY_VALUES: ComponentItem[] = [
	{
		id: 'work-first',
		title: 'The work comes first',
		content: 'Search runs on portfolios, styles, and distance — never follower counts. A great tattooer with 90 followers outranks a mediocre one with 90,000.',
	},
	{
		id: 'artist-terms',
		title: 'Artists set the terms',
		content: 'Bidding starts where the artist says it starts. Floors, slots, availability — the chair belongs to the person holding the machine.',
	},
	{
		id: 'verification-process',
		title: 'Trust is earned in ink',
		content: 'Verification is manual. Reviews come only from completed sessions. A ★4.9 on Inkquest means 4.9 in real skin.',
	},
	{
		id: 'validation-guarantee',
		title: 'Skin is permanent. We act like it.',
		content: 'No dark patterns, no rushed bookings. Deposits, consults, and cancellation terms are stated up front, every time.',
	},
]

interface TeamItem {
	id: string
	name: string
	role?: ReactNode[]
}

const TEAM_MEMBERS: TeamItem[] = [
	{
		id: 'ceo-ren',
		name: 'Ren Okafor',
		role: ['Co-founder', 'CEO'],
	},
	{
		id: 'founder-june',
		name: 'June Park',
		role: ['Co-founder', 'Design'],
	},
	{
		id: 'engineer-june',
		name: 'Marisol Deng',
		role: ['Engineering'],
	},
	{
		id: 'pr-tomas',
		name: 'Tomás Reyes',
		role: ['Artist relations'],
	},
	{
		id: 'compliance-priya',
		name: 'Priya Nair',
		role: ['Trust & safety'],
	},
	{
		id: 'community-priya',
		name: 'Effie Stone',
		role: ['Community'],
	},
]

interface PressItem {
	id: string
	author: string
	title: string
	publishDate?: CalendarDate
	url?: Route<string>
}

const PRESS_QUOTES: PressItem[] = [
	{
		id: 'ledger',
		author: 'The Ledger',
		title: 'The rare marketplace that tilts the economics toward the artist.',
	},
	{
		id: 'canvas-weekly',
		author: 'Canvas Weekly',
		title: 'Part gallery, part auction house — all conviction.',
	},
	{
		id: 'ink-review',
		author: 'Ink Review',
		title: 'Finding the right artist finally feels like crate-digging, in the best way.',
	},
]

export default function About() {
	const pageID = 'about'

	return (
		<>
			<Section
				eyebrow="About · Est. 2024 · Brooklyn, NY"
				id={ `${pageID}-hero` }
				layout="hero"
				title="The work comes first."
			>
				Inkquest is a marketplace and community connecting tattoo artists with clients — search by style and distance, bid on flash designs and open slots, and book directly.

				<Section.Button href="/discover">Find your artist</Section.Button>
				<Section.Button href="/careers">See open roles</Section.Button>
			</Section>

			<Section
				eyebrow="Our story"
				id={ `${pageID}-story` }
				layout="split"
				title="From a flash sheet to parlor."
			>
				<Timeline>
					{ STORY_TIMELINE.map(step => <Timeline.Item key={ step.id } { ...step } />) }
				</Timeline>
			</Section>

			<Section id={ `${pageID}-stats` } layout="blocks">
				<Statistic.Group>
					{ PLATFORM_STATS.map(({ isHighlight, ...stat }) => (
						<Statistic highlight={ isHighlight } { ...stat } />
					)) }
				</Statistic.Group>
			</Section>

			<Section
				eyebrow="Values"
				id={ `${pageID}-values` }
				title="What we believe."
			>
				<Accordion.Group layout="steps">
					{ COMPANY_VALUES.map(({ content, id, title }) => (
						<Accordion id={ id } key={ `${id}-value` }>
							<Accordion.Title>{ title }</Accordion.Title>
							<Accordion.Content>{ content }</Accordion.Content>
						</Accordion>
					)) }
				</Accordion.Group>
			</Section>

			<Section
				eyebrow="Team"
				id={ `${pageID}-team` }
				title="The crew."
			>
				<Grid columns={ 3 }>
					{ TEAM_MEMBERS.map(({ id, name, role }) => (
						<Card
							key={ `${id}-member` }
							title={ name }
							caption={ role?.join(' · ') }
						/>
					)) }
				</Grid>
			</Section>

			<Section
				eyebrow="Press"
				id={ `${pageID}-press` }
				title="In the press."
			>
				<Grid columns={ 3 }>
					{ PRESS_QUOTES.map(({ author, id, title }) => (
						<Quote
							key={ `${id}-quote` }
							author={ author }
							content={ title }
						/>
					)) }
				</Grid>
				<Section.Button href="/press" variant="outline">
					See all press mentions
				</Section.Button>
			</Section>

			<Section
				eyebrow="Careers · Brooklyn + remote"
				id={ `${pageID}-cta` }
				layout="cta"
				title="Do your best work here."
			>
				We're a growing team in Brooklyn hiring across engineering, community, and artist relations.

				<Section.Button href="/careers">See open roles</Section.Button>
				<Section.Button href="/press">Get the press kit</Section.Button>
			</Section>
		</>
	)
}
