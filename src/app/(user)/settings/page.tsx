'use client'

import { useColorScheme } from '@/hooks/useColorScheme'
import { Button } from '@/components/core/Button'
import { Icon } from '@/components/core/Icon'
import { Section } from '@/components/layout/Section'

export default function Settings() {
	const { setColorScheme } = useColorScheme()

	const pageID = 'settings'

	return (
		<>
			<Section
				id={ `${pageID}-hero` }
				layout="hero"
				title="Settings"
			>
				<Button.Group id="theme-selection" orientation="vertical">
					<Button key="test123" onClick={ () => setColorScheme('dark') }>
						<Button.Section left>
							<Icon type="dark-theme" />
						</Button.Section>
						dark
					</Button>
					<Button variant="ghost" onClick={ () => setColorScheme('light') }>
						light
						<Button.Section right>
							<Icon type="light-theme" />
						</Button.Section>
					</Button>
				</Button.Group>
			</Section>
		</>
	)
}
