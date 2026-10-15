'use client'

import { CareersCulture } from './culture'
import { CareersHero } from './hero'
import { CareersListings } from './listings'
import { CareersProcess } from './process'

export const CareersBase = () => {
	return (
		<>
			<CareersHero />
			<CareersCulture />
			<CareersListings />
			<CareersProcess />
		</>
	)
}

CareersBase.displayName = 'CareersBase'
