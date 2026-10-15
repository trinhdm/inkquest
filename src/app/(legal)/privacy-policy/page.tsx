'use client'

import {
	PRIVACY_SECTIONS, VERSION_HISTORY,
	type LegalSection,
} from './privacy-policy.data'

import { useOptimistic, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/utils/helpers'
import { Accordion } from '@/components/data/Accordion'
import { Button } from '@/components/core/Button'
import { Grid } from '@/components/layout/Grid'
import { Section } from '@/components/layout/Section'
import { Sidebar } from '@/components/layout/Sidebar'
import type { Route } from 'next'

const getSectionUrl = (id: string): Route<string> =>
	`/privacy-policy#${id}`

const formatLegalTitle = (
	title: LegalSection['title'],
	index: number,
): string =>
	`${index + 1}. ${title}`

const findLegalTitles = (sections: LegalSection[]): Sidebar.LinkItem[] =>
	sections.map(({ id, title }, i) => ({
		id,
		label: formatLegalTitle(title, i),
		url: getSectionUrl(id),
	}))

const resolveLegalSection = (
	id?: string,
	sections: LegalSection[] = PRIVACY_SECTIONS,
): LegalSection =>
	sections.find(section => section.id === id) ?? sections[0]

export default function PrivacyPolicy() {
	const pageID = 'privacy-policy'

	const sections = PRIVACY_SECTIONS.filter(({ title }) => !!title),
		titles = findLegalTitles(sections),
		urlID = titles[0].id

	const router = useRouter()
	const [optimisticID, setOptimisticID] = useOptimistic(urlID)
	const [isPending, startTransition] = useTransition()
	const [open, setOpen] = useState(false)

	const currentSection = resolveLegalSection(optimisticID, sections)

	const selectSection = (id: string) => {
		startTransition(() => {
			setOptimisticID(id)
			router.push(getSectionUrl(id), { scroll: true })
		})
	}

	return (
		<>
			<Section
				className="legal-history"
				eyebrow="Last updated June 12, 2026 · Effective July 1, 2026"
				id={ `${pageID}-hero` }
				layout="hero-tight"
				title="Privacy Policy"
			>
				<Accordion
					id={ `${pageID}-history` }
					indicatorPosition="left"
					layout="blockquote"
					open={ open }
					onToggle={ setOpen }
				>
					<Accordion.Title>{ open ? 'Hide' : 'Show' } version history</Accordion.Title>
					<Accordion.Content>
						{ !!VERSION_HISTORY.length && (
							<ul className="legal-history__list">
								{ VERSION_HISTORY.map(({ date, note, version }) => {
									const calendarDate = formatDate(date)

									return (
										<li key={ `${version}-${calendarDate}` }>
											<div className="legal-history__overview">
												<strong>V{ String(version) }</strong>
												{ !!calendarDate.length && <span>{ calendarDate }</span> }
											</div>
											<span className="legal-history__details">{ note }</span>
										</li>
									)
								}) }
							</ul>
						) }
					</Accordion.Content>
				</Accordion>
				<Section.Footer>
					<Button action="print" size="sm" variant="outline">Print</Button>
				</Section.Footer>
			</Section>

			<Section id={ `${pageID}-content` }>
				<Grid
					attributes={ { aria: { busy: isPending || undefined } } }
					gap="lg"
					layout="sidebar"
				>
					<Sidebar
						active={ currentSection.id }
						items={ titles }
						onChange={ selectSection }
						scroll={ true }
					/>
					<Grid.Item className="legal-content">
						{ PRIVACY_SECTIONS.map(({ body, id, summary, title }) => {
							const index = sections.findIndex(section => section.id === id),
								isIntro = index === -1

							return (
								<Section
									className={ `legal-content__${isIntro ? 'intro' : 'section' }` }
									id={ id }
									key={ id }
									layout="content"
									title={ isIntro ? undefined : formatLegalTitle(title, index) }
								>
									{ (summary && !isIntro) && (
										<aside className="legal-content__summary">
											<span className="legal-content__label">TL;DR</span>
											<p>{ summary }</p>
										</aside>
									) }

									<div className="legal-content__body">
										{ body.map(content => (
											Object.entries(content).map(([key, value]) => {
												const contentKey = `${id}-${value}`

												if (key === 'p')
													return <p key={ contentKey }>{ value }</p>

												return (
													<ul key={ contentKey }>
														{ (value as string[]).map(v => <li key={ v }>{ v }</li>) }
													</ul>
												)
											})
										)) }
									</div>
								</Section>
							)
						}) }
					</Grid.Item>
				</Grid>
			</Section>

			<Section id={ `${pageID}-footer` }>
				<div className="legal-footnote">
					<h2 className="legal-footnote__label">Data Protection Officer</h2>
					<div className="legal-footnote__content">
						Questions, access requests, or complaints about how we handle your personal data can be directed to our Data Protection Officer.
						<a href="mailto:privacy@inkquest.com">privacy@inkquest.com</a>
						<span>Inkquest, Inc. · Attn: DPO · 550 Bryant Street, Suite 400 · San Francisco, CA 94107</span>
					</div>
				</div>
			</Section>
		</>
	)
}
