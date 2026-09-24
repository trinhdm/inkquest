import type { Config } from 'jest'
import nextJest from 'next/jest'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
	testEnvironment: 'jsdom',
	setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
	// Two layouts, on purpose:
	//   - `src/components/**` colocates a suite next to its component.
	//   - everywhere else groups suites in a `__tests__/` folder beside the
	//     module they cover.
	// Both patterns require `.test.` in the filename, which is narrower than
	// Jest's default: the default treats EVERY file under `__tests__/` as a
	// suite, sweeping in `specs.test-d.ts` (compile-time assertions, no
	// runtime tests) and any fixture or helper placed there later.
	testMatch: [
		'<rootDir>/src/components/**/*.test.[jt]s?(x)',
		'<rootDir>/src/**/__tests__/**/*.test.[jt]s?(x)',
	],
	// Playwright owns `e2e/` — without this Jest's default testMatch picks up
	// the `*.spec.ts` files there and fails on the `@playwright/test` import.
	// `.stryker-tmp` matters just as much: Stryker copies the whole project
	// there to mutate it, so leaving it out makes Jest run every suite twice
	// — once against deliberately broken source.
	testPathIgnorePatterns: [
		'<rootDir>/e2e/',
		'<rootDir>/.next/',
		'<rootDir>/node_modules/',
		'<rootDir>/.stryker-tmp/',
		'<rootDir>/reports/',
	],
	modulePathIgnorePatterns: ['<rootDir>/.stryker-tmp/'],
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1',
	},
	collectCoverageFrom: [
		'src/**/*.{ts,tsx}',
		// Tests, stories and type-only files describe behavior rather than
		// implement it — counting them inflates the numbers.
		'!src/**/*.{test,stories}.{ts,tsx}',
		'!src/**/*.test-d.ts',
		'!src/**/*.story.ts',
		'!src/**/*.d.ts',
		'!src/types/**',
		'!src/tests/**',
		'!src/**/__tests__/**',
		// Barrels are re-exports with no branches of their own.
		'!src/**/index.{ts,tsx}',
		// Route components are exercised by Playwright, not Jest. Including
		// them here would report them as 0% and make the floor meaningless.
		'!src/app/**',
	],
	// A ratchet, not a target. Set a few points under the measured baseline
	// (94.2 / 91.8 / 91.0 / 96.0) so ordinary churn doesn't fail the build,
	// while a real drop in coverage does. Raise these as coverage improves.
	coverageThreshold: {
		global: {
			statements: 92,
			branches: 89,
			functions: 88,
			lines: 93,
		},
	},
}

export default createJestConfig(config)
