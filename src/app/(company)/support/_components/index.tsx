'use client'

import Link from 'next/link'
import { useForm } from '@/hooks/form'
import { initFormState } from '@/lib/form'
import { supportArtist, supportClient } from '../_utils/actions'
import { Grid } from '@/components/layout/Grid'
import { Section } from '@/components/layout/Section'
import { Sidebar } from '@/components/layout/Sidebar'
import { SupportForm } from './form'
import { Tab } from '@/components/data/Tab'
import { ARTIST_SUPPORT, CLIENT_SUPPORT, EMAIL_GROUPS } from '../_utils/data'

export const SupportBase = () => {
	const pageID = 'support'

	const artistForm = useForm(supportArtist, initFormState),
		clientForm = useForm(supportClient, initFormState)

	return (
		<>
			<Section
				eyebrow="Contact"
				id={ `${pageID}-hero` }
				layout="hero"
				title="Talk to a human."
			>
				<>
					Pick who you are and what it&apos;s about — we&apos;ll route it to the right person. Quick question? The <Link href="/faqs" data-cta>FAQs</Link> might already have it.
				</>
			</Section>

			<Section id={ `${pageID}-contact` }>
				<Grid layout="sidebar">
					<Grid.Item id={ `${pageID}-contact-form` }>
						<Tab.Group id={ `${pageID}-tabs` }>
							<Tab.List>
								<Tab>Client</Tab>
								<Tab>Artist</Tab>
								<Tab>Studio</Tab>
							</Tab.List>

							<Tab.Panel>
								<SupportForm
									{ ...clientForm }
									id="form-client"
									topics={ CLIENT_SUPPORT }
								/>
							</Tab.Panel>

							<Tab.Panel>
								<SupportForm
									{ ...artistForm }
									id="form-artist"
									topics={ ARTIST_SUPPORT }
								/>
							</Tab.Panel>

							<Tab.Panel>
								studio form coming soon
							</Tab.Panel>
						</Tab.Group>
					</Grid.Item>

					<Sidebar label="Prefer Email?" id={ `${pageID}-emails` }>
						<div className="recipients">
							<div className="recipients__list">
								{ EMAIL_GROUPS.map(({ email, id, recipient }) => (
									<div className="recipient" key={ `${id}-email` }>
										<span className="recipient__name">{ recipient }</span>
										<a href={ `mailto:${email}` } className="recipient__email" data-cta>{ email }</a>
									</div>
								)) }
							</div>

							<p className="recipient__note">No phone lines, no office — Inkquest is fully online. Everything lands with a human either way.</p>
						</div>
					</Sidebar>
				</Grid>
			</Section>
		</>
	)
}

SupportBase.displayName = 'SupportBase'
