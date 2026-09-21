import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	reactCompiler: process.env.NODE_ENV === 'production',
	typedRoutes: true,
	experimental: {
		optimizePackageImports: ['lucide-react'],
		turbopackFileSystemCacheForDev: false,
	},
	// sassOptions: {
	// 	additionalData: `@use "@/styles/tokens/_index.scss" as *;`,
	// },
}

export default nextConfig
