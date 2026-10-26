'use client'

import Link from 'next/link'
import { Button } from '@/components/core/Button'
import { Field } from '@/components/form/Field'
import { Grid } from '@/components/layout/Grid'
import { Section } from '@/components/layout/Section'
import { Sidebar } from '@/components/layout/Sidebar'
import { Tab } from '@/components/data/Tab'
import './support.scss'

const EMAIL_GROUPS = [
	{
		id: 'support',
		recipient: 'Support',
		email: 'support@inkquest.com',
	},
	{
		id: 'safety',
		recipient: 'Trust & Safety',
		email: 'safety@inkquest.com',
	},
	{
		id: 'press',
		recipient: 'Press',
		email: 'press@inkquest.com',
	},
	{
		id: 'partners',
		recipient: 'Partnerships',
		email: 'partners@inkquest.com',
	},
]

export default function Support() {
	const pageID = 'support'

	const clientForm = `client-form`,
		clientID = `${clientForm}-field`

	const artistForm = `artist-form`,
		artistID = `${artistForm}-field`

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
								<Grid as="form" columns={ 2 } id={ clientForm }>
									<Grid.Item
										required
										as={ Field.Group }
										className="form-choices"
										id={ `${clientForm}-choices` }
										labelPosition="last"
										layout="button"
										legend="What's it about?"
										span={ 2 }
									>
										<Field
											label="General Support"
											caption="Account, app issues, anything else."
											id={ `${clientID}-choice-general` }
										>
											<Field.Choice
												defaultChecked
												name={ `${clientForm}-topic` }
												value="general"
											/>
										</Field>
										<Field
											label="Booking"
											caption="A bid, deposit, or session that needs a human."
											id={ `${clientID}-choice-booking` }
										>
											<Field.Choice name={ `${clientForm}-topic` } value="booking" />
										</Field>
										<Field
											label="Payments"
											caption="Deposits, escrow, payout timing."
											id={ `${clientID}-choice-payments` }
										>
											<Field.Choice name={ `${clientForm}-topic` } value="payments" />
										</Field>
									</Grid.Item>
									<Grid.Item
										required
										as={ Field }
										id={ `${clientID}-name` }
										label="Name"
										span={ 1 }
									>
										<Field.Input
											name={ `${clientForm}-name` }
											placeholder="John Doe"
										/>
									</Grid.Item>
									<Grid.Item
										required
										as={ Field }
										span={ 1 }
										id={ `${clientID}-email` }
										label="Email"
									>
										<Field.Input
											name={ `${clientForm}-email` }
											placeholder="you@example.com"
											type="email"
										/>
									</Grid.Item>
									<Grid.Item
										required
										as={ Field }
										id={ `${clientID}-message` }
										label="Message"
										span={ 2 }
									>
										<Field.Textarea
											name={ `${clientForm}-message` }
											placeholder="What's going on?"
										/>
									</Grid.Item>
									<Grid.Item
										as={ Field }
										id={ `${clientID}-screenshots` }
										label="Screenshots"
										span={ 2 }
									>
										<Field.Textarea name={ `${clientForm}-screenshots` } />
									</Grid.Item>
									<Button type="submit">Send Message</Button>
								</Grid>
							</Tab.Panel>

							<Tab.Panel>
								<Grid as="form" columns={ 2 } id={ artistForm }>
									<Grid.Item
										required
										as={ Field.Group }
										className="form-choices"
										id={ `${artistForm}-choices` }
										labelPosition="last"
										layout="button"
										legend="What's it about?"
										span={ 2 }
									>
										<Field
											label="General Support"
											caption="Account, app issues, anything else."
											id={ `${artistID}-choice-general` }
										>
											<Field.Choice
												defaultChecked
												name={ `${artistForm}-topic` }
												value="general"
											/>
										</Field>
										<Field
											label="Payments & payouts"
											caption="Deposits, escrow, payout timing."
											id={ `${artistID}-choice-payments` }
										>
											<Field.Choice name={ `${artistForm}-topic` } value="payments" />
										</Field>
										<Field
											label="Verification"
											caption="Getting or keeping the VERIFIED badge."
											id={ `${artistID}-choice-verification` }
										>
											<Field.Choice name={ `${artistForm}-topic` } value="verification" />
										</Field>
										<Field
											label="Press & media"
											caption="Interviews, assets, embargoed things."
											id={ `${artistID}-choice-press` }
										>
											<Field.Choice name={ `${artistForm}-topic` } value="press" />
										</Field>
										<Field
											label="Trust & Safety"
											caption="Report a session, artist, or listing. Read by a human, fast."
											id={ `${artistID}-choice-safety` }
										>
											<Field.Choice name={ `${artistForm}-topic` } value="safety" />
										</Field>
										<Field
											label="Partnerships"
											caption="Conventions, suppliers, integrations."
											id={ `${artistID}-choice-partnerships` }
										>
											<Field.Choice name={ `${artistForm}-topic` } value="partnerships" />
										</Field>
									</Grid.Item>

									<Grid.Item
										required
										as={ Field }
										id={ `${artistID}-name` }
										label="Name"
										span={ 1 }
									>
										<Field.Input
											name={ `${artistForm}-name` }
											placeholder="John Doe"
										/>
									</Grid.Item>
									<Grid.Item
										required
										as={ Field }
										span={ 1 }
										id={ `${artistID}-email` }
										label="Email"
									>
										<Field.Input
											name={ `${artistForm}-email` }
											placeholder="you@example.com"
											type="email"
										/>
									</Grid.Item>
									<Grid.Item
										required
										as={ Field }
										id={ `${artistID}-message` }
										label="Message"
										span={ 2 }
									>
										<Field.Textarea
											name={ `${artistForm}-message` }
											placeholder="What's going on?"
										/>
									</Grid.Item>
									<Grid.Item
										as={ Field }
										id={ `${artistID}-screenshots` }
										label="Screenshots"
										span={ 2 }
									>
										<Field.Textarea name={ `${artistForm}-screenshots` } />
									</Grid.Item>
									<Button type="submit">Send Message</Button>
								</Grid>
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
