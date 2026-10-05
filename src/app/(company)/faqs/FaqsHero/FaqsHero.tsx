'use client'

import Link from 'next/link'
import { Suspense } from 'react'
import { useFaqsCtx } from '../faqs.context'
import { FaqSearch } from './FaqSearch'
import { Field } from '@/components/form/Field'
import { Section } from '@/components/layout/Section'

export const FaqsHero = () => {
	const { pageID } = useFaqsCtx()

	return (
		<Section
			eyebrow="Company · FAQs"
			id={ `${pageID}-hero` }
			layout="hero"
			title="Questions, answered."
		>
			<>Everything about bidding, booking, verification, and payouts — for clients, artists, and studios. Can&apos;t find it? <Link href="/messages" data-cta>Message us</Link>.</>

			<Suspense fallback={ (
				<Field disabled id={ `${pageID}-search` } size="lg">
					<Field.Input placeholder="Search all FAQs…" type="search" />
				</Field>
			) }>
				<FaqSearch />
			</Suspense>
		</Section>
	)
}

FaqsHero.displayName = 'FaqsHero'
