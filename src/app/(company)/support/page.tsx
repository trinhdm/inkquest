'use client'

import Link from 'next/link'
import { Button } from '@/components/core/Button'
import { Field } from '@/components/form/Field'
import { Grid } from '@/components/layout/Grid'
import { Section } from '@/components/layout/Section'
import { Sidebar } from '@/components/layout/Sidebar'
import { Tab } from '@/components/data/Tab'

export default function Support() {
	const pageID = 'support',
		formID = `form-${pageID}`,
		fieldID = `${formID}-field`

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
				<Grid columns={ 4 }>
					<Grid.Item id={ `${pageID}-contact-form` } span={ 3 }>
						<Tab.List>
							<Tab id="client-tab">Client</Tab>
							<Tab id="artist-tab">Artist</Tab>
							<Tab id="studio-tab">Studio</Tab>
						</Tab.List>

						{/* <Tab.Panel>client test</Tab.Panel>
						<Tab.Panel>artist test</Tab.Panel>
						<Tab.Panel>studio test</Tab.Panel> */}

						<Grid as="form" columns={ 2 } id={ formID }>
							<Grid.Item
								required
								as={ Field.Group }
								labelPosition="last"
								layout="button"
								legend="What's it about?"
								span={ 2 }
							>
								<Field
									label="General Support"
									caption="Account, app issues, anything else."
									id={ `${fieldID}-choice-general` }
								>
									<Field.Choice
										defaultChecked
										name={ `${formID}-topic` }
										value="general"
									/>
								</Field>
								<Field
									label="Booking"
									caption="A bid, deposit, or session that needs a human."
									id={ `${fieldID}-choice-booking` }
								>
									<Field.Choice name={ `${formID}-topic` } value="booking" />
								</Field>
								<Field
									label="Payments"
									caption="Deposits, escrow, payout timing."
									id={ `${fieldID}-choice-payments` }
								>
									<Field.Choice name={ `${formID}-topic` } value="payments" />
								</Field>
							</Grid.Item>
							<Grid.Item
								required
								as={ Field }
								id={ `${fieldID}-name` }
								label="Name"
								span={ 1 }
							>
								<Field.Input
									name={ `${formID}-name` }
									placeholder="John Doe"
								/>
							</Grid.Item>
							<Grid.Item
								required
								as={ Field }
								span={ 1 }
								id={ `${fieldID}-email` }
								label="Email"
							>
								<Field.Input
									name={ `${formID}-email` }
									placeholder="you@example.com"
									type="email"
								/>
							</Grid.Item>
							<Grid.Item
								required
								as={ Field }
								id={ `${fieldID}-message` }
								label="Message"
								span={ 2 }
							>
								<Field.Textarea
									name={ `${formID}-message` }
									placeholder="What's going on?"
								/>
							</Grid.Item>
							<Grid.Item
								as={ Field }
								id={ `${fieldID}-screenshots` }
								label="Screenshots"
								span={ 2 }
							>
								<Field.Textarea name={ `${formID}-screenshots` } />
							</Grid.Item>
							<Button type="submit">Send Message</Button>
						</Grid>
					</Grid.Item>
					<Grid.Item as={ Sidebar } span={ 1 }>
						<span className="inkq-eyebrow">Prefer Email?</span>
						<span>No phone lines, no office — Inkquest is fully online. Everything lands with a human either way.</span>
					</Grid.Item>
				</Grid>
			</Section>
		</>
	)
}
