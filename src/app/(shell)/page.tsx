'use client'

import Image from "next/image"
import styles from "./page.module.css"
import { useColorScheme } from '@/hooks/useColorScheme'
import { Button } from '@/components/core/buttons/Button'
// import { useTheme } from '@/providers/ThemeProvider'
import { Icon } from '@/components/core/Icon/Icon'
import { Badge } from '@/components/core/Badge'

export default function Home() {
  const { setColorScheme } = useColorScheme()
  // console.log({ themeName })
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          className={styles.logo}
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className={styles.intro}>
          <h1>To get started, edit the page.tsx file.</h1>
          <Button onClick={ () => setColorScheme('dark') }>dark</Button>
          <Button variant="ghost" onClick={ () => setColorScheme('light') }>light</Button>
          <br /><br />

          <Button variant="solid">solid</Button>
          <Button variant="outline">outline</Button>
          <Button variant="ghost">ghost</Button>
          <Button variant="light">light</Button>
          <Button variant="dark">dark</Button>

          <br /><br />

          { ['danger', 'warning', 'success', 'info'].map(variant => (
            <div key={ variant }>
              { ['primary', 'secondary', 'tertiary'].map(priority => (
                <Button
                  variant={ variant }
                  priority={ priority }
                  key={ `${variant}-${priority}` }
                >
                  { variant }: { priority }
                </Button>
              )) }
            </div>
          )) }

          <Icon type="chevron-right" />

          <Badge>text here</Badge>

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
        <div className={styles.ctas}>
          <a
            className={styles.primary}
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className={styles.logo}
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          <a
            className={styles.secondary}
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}
