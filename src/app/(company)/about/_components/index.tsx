'use client'

import { AboutHero } from './hero'
import { AboutTimeline } from './timeline'
import { AboutStats } from './stats'
import { AboutValues } from './values'
import { AboutTeam } from './team'
import { AboutQuotes } from './quotes'
import { AboutFooter } from './footer'

export const AboutBase = () => {
	return (
		<>
			<AboutHero />
			<AboutTimeline />
			<AboutStats />
			<AboutValues />
			<AboutTeam />
			<AboutQuotes />
			<AboutFooter />
		</>
	)
}

AboutBase.displayName = 'AboutBase'
