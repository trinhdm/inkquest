import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'

const dirname =
	typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
	test: {
		projects: [
			{
				extends: true,
				plugins: [
					// The plugin will run tests for the stories defined in your Storybook config
					// See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
					storybookTest({ configDir: path.join(dirname, '.storybook') }),
				],
				test: {
					name: 'storybook',
					// Array (not a bare string) so Vite CONCATENATES it with the
					// setup files `@storybook/addon-vitest` injects itself,
					// rather than overwriting them. Read the header comment in
					// `.storybook/vitest.setup.ts` before editing that file —
					// the addon decides whether to auto-provision preview
					// annotations by substring-scanning it, so what that file
					// says (not just what it does) changes behaviour.
					setupFiles: [path.join(dirname, '.storybook/vitest.setup.ts')],
					browser: {
						enabled: true,
						headless: true,
						provider: playwright({}),
						instances: [{ browser: 'chromium' }],
					},
				},
			},
		],
	},
})
