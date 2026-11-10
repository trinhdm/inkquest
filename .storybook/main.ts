import remarkGfm from 'remark-gfm'
import type { StorybookConfig } from '@storybook/nextjs-vite'

const config: StorybookConfig = {
	stories: [
		"../src/**/*.mdx",
		"../src/**/*.stories.@(js|jsx|mjs|ts|tsx)",
		// "../src/**/*.story.@(js|jsx|mjs|ts|tsx)"
	],
	addons: [
		"@chromatic-com/storybook",
		"@storybook/addon-vitest",
		"@storybook/addon-a11y",
		// MDX doesn't support GitHub-style markdown (tables, task lists) without remark-gfm
		{
			name: "@storybook/addon-docs",
			options: {
				mdxPluginOptions: {
					mdxCompileOptions: {
						remarkPlugins: [remarkGfm],
					},
				},
			},
		},
		"@storybook/addon-mcp"
	],
	framework: "@storybook/nextjs-vite",
	staticDirs: [
		"../public"
	],
	viteFinal: async (config) => {
		const path = await import('node:path')
		config.resolve ??= {}
		config.resolve.alias = { ...(config.resolve.alias as Record<string, string>), '@': path.resolve(process.cwd(), 'src') }
		return config
	}
}

export default config
