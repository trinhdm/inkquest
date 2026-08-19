'use client'

import Image from "next/image"
import { useColorScheme } from '@/hooks/useColorScheme'
import { Button, type Button as ButtonType } from '@/components/core/Button'
// import { useTheme } from '@/providers/ThemeProvider'
import { Icon } from '@/components/core/Icon/Icon'
import { Badge } from '@/components/core/Badge'
import { Container } from '@/components/layout/Container'

export default function Home() {
	const { setColorScheme } = useColorScheme()
	const variants = ['danger', 'warning', 'success', 'info'] as ButtonType.Props['variant'][]
	const priorities = ['primary', 'secondary', 'tertiary'] as ButtonType.Props['priority'][]

	return (
		<main>
			<Container>
				<Image
					src="/next.svg"
					alt="Next.js logo"
					width={100}
					height={20}
					priority
				/>
				<div>
					<h1>To get started, edit the page.tsx file.</h1>

					<Button.Group id="theme-selection" orientation="vertical">
						<Button key="test123" onClick={ () => setColorScheme('dark') }>
							<Button.Section left>
								<Icon size={ 16 } type="dark-theme" />
							</Button.Section>
							dark
						</Button>
						<Button variant="ghost" onClick={ () => setColorScheme('light') }>
							light
							<Button.Section right>
								<Icon size={ 16 } type="light-theme" />
							</Button.Section>
						</Button>
					</Button.Group>

					<Button.Group className="variants">
						<Button variant="solid">solid</Button>
						<Button variant="outline">outline</Button>
						<Button variant="ghost">ghost</Button>
						<Button variant="light">light</Button>
						<Button variant="dark">dark</Button>
					</Button.Group>

					{ variants.map(variant => (
						<Button.Group key={ variant }>
							{ priorities.map(priority => (
								<Button
									variant={ variant }
									key={ `${variant}-${priority}` }
								>
									{ variant }: { priority }
								</Button>
							)) }
						</Button.Group>
					)) }

					<Button loading>
						<Button.Section left>
							<Icon size={ 16 } type="left-caret" />
						</Button.Section>
						with sections
						<Button.Section right>
							<Icon size={ 16 } type="right-caret" />
						</Button.Section>
					</Button>

					<Icon type="right-caret" />

					<Badge>default badge</Badge>
					<Badge shape="round">1</Badge>

					<br /><br />
					<p>
					Looking for a starting point or more instructions? Head over to{" "}
					<a
						href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
						target="_blank"
						rel="noopener noreferrer"
					>
						Templates
					</a>{" "}
					or the{" "}
					<a
						href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
						target="_blank"
						rel="noopener noreferrer"
					>
						Learning
					</a>{" "}
					center.
					</p>
				</div>
				<div>
					<a
						href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
						target="_blank"
						rel="noopener noreferrer"
					>
					<Image
						src="/vercel.svg"
						alt="Vercel logomark"
						width={16}
						height={16}
					/>
					Deploy Now
					</a>
					<a
						href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
						target="_blank"
						rel="noopener noreferrer"
					>
					Documentation
					</a>
				</div>
			</Container>
		</main>
	)
}
