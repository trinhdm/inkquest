'use client'

import Image from "next/image"
import { useColorScheme } from '@/hooks/useColorScheme'
import { Badge, Button, Icon } from '@/components/core'
import { Container } from '@/components/layout'

export default function Home() {
	const { setColorScheme } = useColorScheme()
	const variants = ['danger', 'warning', 'success', 'info'] as Button.Props['variant'][]
	const priorities = ['primary', 'secondary', 'tertiary'] as Button.Props['priority'][]

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

					<Button loading className="with-load" id="btn-loading">
						<Button.Section left className="section-loading">
							<Icon type="caret-left" />
						</Button.Section>
						with sections
						<Button.Section right>
							<Icon type="caret-right" />
						</Button.Section>
					</Button>

					<Icon className="single-icon" type="caret-right" />

					<Badge>default badge</Badge>
					<Badge className="test" id="badge-round" shape="round">1</Badge>

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
