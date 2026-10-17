'use client'

import { useState } from 'react'
import { Button } from '@/components/core/Button'
import { Icon } from '@/components/core/Icon'
import { Field } from '@/components/form/Field'
import { Grid } from '@/components/layout/Grid'
import { Section } from '@/components/layout/Section'
import Link from 'next/link'

type SignupStage =
	'join' | 'verify' | 'sso' | 'success'

export default function Signup() {
	const [stage, setStage] = useState<SignupStage>('join')

	const pageID = 'signup'
	let formID = `form-${pageID}`,
		fieldID = `${formID}-field`

	const handleSignupFlow = (next: SignupStage) => {
		setStage(next)
	}

	if (stage === 'success') {
		formID = `form-${pageID}-${stage}`
		fieldID = `${formID}-field`

		return (
			<Section
				eyebrow="Success!"
				id={ `${pageID}-${stage}` }
				layout="content-form"
				title="Account created."
			>
				You’re in. A two-minute setup tunes your feed, search, and profile.

				<Grid as="form" columns={ 1 } id={ formID }>
					<Field
						readonly
						id={ `${fieldID}-email-signup` }
						label="Email"
						layout="inline"
					>
						<Field.Input
							name={ `${formID}-email-signup` }
							type="email"
							value="you@example.com"
						/>
					</Field>

					<Button animate="right" href="/community/feed">
						Start setup
						<Button.Section right><Icon type="arrow-right" /></Button.Section>
					</Button>

					<div className="authentication__note">
						<p>Setup takes about two minutes — styles, location, and (for artists) your shop.</p>
					</div>
				</Grid>
			</Section>
		)
	}

	if (stage === 'verify') {
		formID = `form-${pageID}-${stage}`
		fieldID = `${formID}-field`

		return (
			<Section
				eyebrow="Verify Email"
				id={ `${pageID}-${stage}` }
				layout="content-form"
				title="Check your email"
			>
				We sent a 6-digit code to scout.finch@gmail.com. Enter it below.

				<Grid as="form" columns={ 1 } id={ formID }>
					<Field.Group legend="">
						<Field
							id={ `${fieldID}-code-1` }
							label="1"
						>
							<Field.Input
								name={ `${formID}-code-1` }
								inputMode="numeric"
							/>
						</Field>
					</Field.Group>

					<Button.Group hasPriority={ false }>
						<Button
							animate="left"
							onClick={ () => handleSignupFlow('join') }
							variant="ghost"
						>
							Back
							<Button.Section left><Icon type="arrow-left" /></Button.Section>
						</Button>
						<Button
							animate="right"
							onClick={ () => handleSignupFlow('success') }
						>
							Verify
							<Button.Section right><Icon type="arrow-right" /></Button.Section>
						</Button>
					</Button.Group>

					<div className="authentication__note">
						<Button unstyled data-link onClick={ () => handleSignupFlow('join') }>
							Resend code
						</Button>
						<span>·</span>
						<Button unstyled data-link onClick={ () => handleSignupFlow('join') }>
							Wrong email?
						</Button>
					</div>
				</Grid>
			</Section>
		)
	}

	return (
		<Section
			eyebrow="Create Account"
			id={ `${pageID}-${stage}` }
			layout="content-form"
			title="Join Inkquest."
		>
			One account for finding artists, bidding on flash, and booking.

			<Grid as="form" columns={ 1 } id={ formID }>
				<Field
					required
					id={ `${fieldID}-email` }
					label="Email"
				>
					<Field.Input
						name={ `${formID}-email` }
						placeholder="you@example.com"
						type="email"
					/>
				</Field>

				<Field
					required
					id={ `${fieldID}-password` }
					label="Password"
				>
					<Field.Input
						name={ `${formID}-password` }
						placeholder="Your password"
						type="password"
					/>
				</Field>

				<div className="password">
					<div className="password__strength">
						<ul className="password__requirements" data-unlist>
							<li className="password__check">
								<span className="password__status" />
								<span>8+ characters</span>
							</li>
							<li className="password__check">
								<span className="password__status" />
								<span>Upper & lower case</span>
							</li>
							<li className="password__check">
								<span className="password__status" />
								<span>A number</span>
							</li>
							<li className="password__check">
								<span className="password__status" />
								<span>A symbol</span>
							</li>
						</ul>
					</div>
				</div>

				<div className="form__ctas authentication">
					<Button
						fullWidth
						animate="right"
						className="authentication__email"
						onClick={ () => handleSignupFlow('verify') }
						type="submit"
					>
						Create account
						<Button.Section right><Icon type="arrow-right" /></Button.Section>
					</Button>

					<div className="authentication__label" role="presentation">
						<span>or</span>
					</div>

					<Button.Group
						fullWidth
						className="authentication__sso"
						hasPriority={ false }
					>
						<Button
							fullWidth
							onClick={ () => handleSignupFlow('success') }
							variant="outline"
						>
							<Button.Section><Icon type="google" /></Button.Section>
							Continue with Google
						</Button>
						<Button
							fullWidth
							onClick={ () => handleSignupFlow('success') }
							variant="outline"
						>
							<Button.Section><Icon type="apple" /></Button.Section>
							Continue with Apple
						</Button>
					</Button.Group>

					<div className="authentication__note">
						<p>By creating an account, you confirm you&apos;re 18+ and agree to the <Link href="/terms" data-link>Terms</Link> and <Link href="/privacy-policy" data-link>Privacy Policy</Link>.</p>
					</div>
				</div>
			</Grid>
		</Section>
	)
}
