import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	// reactCompiler: false,
	reactCompiler: true,
	typedRoutes: true,
	experimental: {
		optimizePackageImports: ['lucide-react'],
	},
	// sassOptions: {
	// 	additionalData: `@use "@/styles/tokens/_index.scss" as *;`,
	// },
}

export default nextConfig
