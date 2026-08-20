import type { StorybookConfig } from '@storybook/nextjs-vite'

const config: StorybookConfig = {
	"stories": [
		"../src/**/*.mdx",
		"../src/**/*.stories.@(js|jsx|mjs|ts|tsx)",
		// "../src/**/*.story.@(js|jsx|mjs|ts|tsx)"
	],
	"addons": [
		"@chromatic-com/storybook",
		"@storybook/addon-vitest",
		"@storybook/addon-a11y",
		"@storybook/addon-docs",
		"@storybook/addon-mcp"
	],
	"framework": "@storybook/nextjs-vite",
	"staticDirs": [
		"../public"
	],
	previewHead: (head) => `${head}
<style>
	/* addon-docs forces the live-story preview box to white; let it follow the app's theme instead */
	html[data-inkq-scheme] .sbdocs-preview {
		background: var(--inkq-background-page);
	}
</style>`,
}

export default config
