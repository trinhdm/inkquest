'use client'

import {
	COMPANY_VALUES,
	PLATFORM_STATS,
	PRESS_QUOTES,
	STORY_TIMELINE,
	TEAM_MEMBERS,
} from './about.data'

import { Accordion } from '@/components/data/Accordion'
import { Button } from '@/components/core/Button'
import { Card } from '@/components/core/Card'
import { Grid } from '@/components/layout/Grid'
import { Quote } from '@/components/data/Quote'
import { Section } from '@/components/layout/Section'
import { Statistic } from '@/components/data/Statistic'
import { Timeline } from '@/components/data/Timeline'

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

				<Section.Footer>
					<Button href="/discover">Find your artist</Button>
					<Button href="/careers">See open roles</Button>
				</Section.Footer>
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
						<Statistic key={ stat.id } highlight={ isHighlight } { ...stat } />
					)) }
				</Statistic.Group>
			</Section>

			<Section
				eyebrow="Values"
				id={ `${pageID}-values` }
				title="What we believe."
			>
				<Accordion.Group layout="steps" size="lg">
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
				<Section.Footer>
					<Button href="/press" variant="outline">See all press mentions</Button>
				</Section.Footer>
			</Section>

			<Section
				eyebrow="Careers · Brooklyn + remote"
				id={ `${pageID}-banner` }
				layout="banner"
				title="Do your best work here."
			>
				We&apos;re a growing team in Brooklyn hiring across engineering, community, and artist relations.

				<Section.Footer>
					<Button href="/careers">See open roles</Button>
					<Button href="/press">Get the press kit</Button>
				</Section.Footer>
			</Section>
		</>
	)
}
