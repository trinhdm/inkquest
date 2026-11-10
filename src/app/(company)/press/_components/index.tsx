'use client'

import { PressAssets } from './assets'
import { PressHero } from './hero'
import { PressMentions } from './mentions'
import { PressStats } from './stats'
import { PressStory } from './story'

export const PressBase = () => {
	return (
		<>
			<PressHero />
			<PressStory />
			<PressStats />
			<PressAssets />
			<PressMentions />
		</>
	)
}

PressBase.displayName = 'PressBase'
