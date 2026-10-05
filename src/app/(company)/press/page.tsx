'use client'

import Link from 'next/link'
import { Copy } from 'lucide-react'
import { Button } from '@/components/core/Button'
import { Grid } from '@/components/layout/Grid'
import { Group } from '@/components/layout/Group'
import { Section } from '@/components/layout/Section'
import { Statistic } from '@/components/data/Statistic'
import { Table } from '@/components/data/Table'
import { ASSETS_LIST, COMPANY_STATS, PRESS_HISTORY } from './press.data'
import type { Route } from 'next'
import './press.scss'

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
				<>Everything you need — boilerplate, facts, logos, and photography. For interviews and anything not covered here, email <a href="press@inkquest.com" data-cta>press@inkquest.com</a>.</>

				<Section.Button>Download full kit (ZIP)</Section.Button>
			</Section>

			<Section
				eyebrow="Our story"
				id={ `${pageID}-about` }
				layout="split"
				title="About Inkquest."
			>
				Inkquest is a marketplace and community connecting tattoo artists with clients. Clients search by style and distance, bid on flash designs and open booking slots, and book directly — with the artist setting the floor price on every piece. Founded in Brooklyn in 2024, Inkquest hosts more than 12,400 verified artists across 38 cities and has paid over $9.2M directly to artists.

				<Section.Button size="sm" variant="outline">
					<Section.Button.Section left>
						<Copy />
					</Section.Button.Section>
					Copy boilerplate
				</Section.Button>
			</Section>

			<Section id={ `${pageID}-stats` } layout="blocks">
				<Statistic.Group animated={ false } order="ascend" size="sm">
					{ COMPANY_STATS.map(({ isHighlight, ...stat }) => (
						<Statistic key={ stat.id } highlight={ isHighlight } { ...stat } />
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
								<Table.Cell>
									<strong>{ author }</strong>
								</Table.Cell>

								<Table.Cell className="inkq-prose">
									{ !!url
										? <Link href={ url }>{ headline }</Link>
										: <span>{ headline }</span> }
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
