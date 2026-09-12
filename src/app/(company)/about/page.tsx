'use client'

import { Accordion, Quote, Statistic, Timeline } from '@/components/data'
import { Card, Icon } from '@/components/core'
import { Grid, Section } from '@/components/layout'

const STORY_TIMELINE = [
	{
		title: '2023',
		content: 'A flash sheet taped to a studio wall sells out in an afternoon — to people bidding in the comments of a group chat. The idea writes itself.',
	},
	{
		title: '2024',
		content: 'Inkquest launches in Brooklyn with 61 artists. One rule from day one: the artist sets the floor.',
	},
	{
		title: '2025',
		content: 'The marketplace opens — flash designs and open slots, bid in real time. First $1M paid out to artists.',
	},
	{
		title: '2026',
		content: '38 cities, 12,000+ artists. Still black. Still red. Still the work first.',
	},
]

const COMPANY_VALUES = [
	{
		id: 'work',
		title: 'The work comes first',
		content: 'Search runs on portfolios, styles, and distance — never follower counts. A great tattooer with 90 followers outranks a mediocre one with 90,000.',
	},
	{
		id: 'terms',
		title: 'Artists set the terms',
		content: 'Bidding starts where the artist says it starts. Floors, slots, availability — the chair belongs to the person holding the machine.',
	},
	{
		id: 'verification',
		title: 'Trust is earned in ink',
		content: 'Verification is manual. Reviews come only from completed sessions. A ★4.9 on Inkquest means 4.9 in real skin.',
	},
	{
		id: 'validation',
		title: 'Skin is permanent. We act like it.',
		content: 'No dark patterns, no rushed bookings. Deposits, consults, and cancellation terms are stated up front, every time.',
	},
]

const TEAM_MEMBERS = [
	{
		name: 'Ren Okafor',
		role: 'Co-founder · CEO',
	},
	{
		name: 'June Park',
		role: 'Co-founder · Design',
	},
	{
		name: 'Marisol Deng',
		role: 'Engineering',
	},
	{
		name: 'Tomás Reyes',
		role: 'Artist relations',
	},
	{
		name: 'Priya Nair',
		role: 'Trust & safety',
	},
	{
		name: 'Effie Stone',
		role: 'Community',
	},
]

const PRESS_QUOTES = [
	{
		author: 'The Ledger',
		quote: 'The rare marketplace that tilts the economics toward the artist.',
	},
	{
		author: 'Canvas Weekly',
		quote: 'Part gallery, part auction house — all conviction.',
	},
	{
		author: 'Ink Review',
		quote: 'Finding the right artist finally feels like crate-digging, in the best way.',
	},
]

export default function About() {
	return (
		<>
			<Section
				eyebrow="About · Est. 2024 · Brooklyn, NY"
				id="about-hero"
				layout="hero"
				title="The work comes first."
			>
				Inkquest is a marketplace and community connecting tattoo artists with clients — search by style and distance, bid on flash designs and open slots, and book directly.

				<Section.Button href="/discover">Find your artist</Section.Button>
				<Section.Button href="/careers">See open roles</Section.Button>
			</Section>

			<Section
				eyebrow="Our story"
				id="about-story"
				layout="split"
				title="From a flash sheet in Bushwick."
			>
				<Timeline>
					{ STORY_TIMELINE.map(step => <Timeline.Item key={ step.title } { ...step } />) }
				</Timeline>
			</Section>

			<Section id="about-stats" layout="blocks">
				<Statistic.Group>
					<Statistic caption="Artists on platform" value="12,400+" />
					<Statistic caption="Cities" value="38" />
					<Statistic highlight caption="Paid to artists" value="$9.2M" />
					<Statistic caption="Avg session rating" icon={ <Icon filled type="rating" /> } value="4.8" />
				</Statistic.Group>
			</Section>

			<Section
				eyebrow="Values"
				id="about-values"
				title="What we believe."
			>
				<Accordion defaultOpen id="single-acc">
					<Accordion.Title>single accordion test</Accordion.Title>
					<Accordion.Content>
						Search runs on portfolios, styles, and distance — never follower counts. A great tattooer with 90 followers outranks a mediocre one with 90,000.
					</Accordion.Content>
				</Accordion>

				<Accordion.Group layout="steps">
					{ COMPANY_VALUES.map(({ content, id, title }) => (
						<Accordion id={ id }>
							<Accordion.Title>{ title }</Accordion.Title>
							<Accordion.Content>
								{ content }
							</Accordion.Content>
						</Accordion>
					))}
				</Accordion.Group>
			</Section>

			<Section
				eyebrow="Team"
				id="about-team"
				title="The crew."
			>
				<Grid columns={ 3 }>
					{ TEAM_MEMBERS.map(({ name, role }) => (
						<Card
							key={ `${name}-${role}` }
							title={ name }
							caption={ role }
						/>
					)) }
				</Grid>
			</Section>

			<Section
				eyebrow="Press"
				id="about-press"
				title="In the press."
			>
				<Grid columns={ 3 }>
					{ PRESS_QUOTES.map(item => <Quote key={ item.quote } { ...item } />) }
				</Grid>
				<Section.Button href="/press" variant="outline">
					See all press mentions
				</Section.Button>
			</Section>

			<Section
				eyebrow="Careers · Brooklyn + remote"
				id="about-cta"
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
