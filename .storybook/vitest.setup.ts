// Setup file for the `storybook` Vitest project — a home for CUSTOM test-time
// code that should run before every story test (global lifecycle hooks, MSW
// server start/stop, custom matchers, deterministic environment stubs).
//
// ─────────────────────────────────────────────────────────────────────────────
// ⚠️  NEVER write the preview-annotation registration call in this file —
//     and never even mention its name here. See below.
// ─────────────────────────────────────────────────────────────────────────────
// Since Storybook 10.3, `@storybook/addon-vitest` registers the preview
// annotations for us: its Vitest plugin injects
// `@storybook/addon-vitest/internal/setup-file` alongside
// `@storybook/addon-vitest/internal/setup-file-with-project-annotations`, and
// the latter performs the registration.
//
// That auto-provisioning is CONDITIONAL, and the condition is a naive SUBSTRING
// SCAN — not a parse. The plugin's `requiresProjectAnnotations()` helper does:
//
//     readFileSync(setupFile, 'utf-8').includes('<the registration fn name>')
//
// for any configured setup file living in `configDir` (i.e. this directory). If
// that substring appears ANYWHERE in the file — in a real call, in a comment, in
// a string literal — the plugin assumes we've taken over, skips injecting its
// own annotation setup, and logs "Found a setup file with ... Skipping automatic
// provisioning of preview annotations".
//
// Because it is a substring scan, merely DOCUMENTING the function by name is
// enough to trigger it. That is not hypothetical: an earlier version of this
// file named the function in these very comments and took all 209 story tests
// down with it, since every story then rendered without preview annotations.
//
// So: keep this file free of that identifier, in code and in prose alike, and
// the addon will keep managing annotations while still running whatever custom
// setup we add below.
//
// Registered as an ARRAY entry in `vitest.config.ts` (not a bare string): the
// plugin only re-appends a pre-existing `setupFiles` value when it was a string,
// because Vite's config merge would otherwise overwrite it. As an array, Vite
// concatenates, so the addon's internal setup files and this one all run.

export {}

// Add custom setup below. Examples of what belongs here:
//
//   import { beforeAll, afterAll, afterEach } from 'vitest'
//   import { server } from '../src/mocks/server'
//
//   beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
//   afterEach(() => server.resetHandlers())
//   afterAll(() => server.close())
//
// Note that `storybook/test` already provides jest-dom matchers, so they do NOT
// need to be registered here.
//
// Be deliberate about anything that changes animation or motion behaviour:
// several components in this design system read `useInView` and
// `useReducedMotion` from framer-motion (`Group`, `AccordionGroup`,
// `AccordionContent`) and `Statistic` drives a `useCountUp` animation. A global
// stub for `matchMedia`/`IntersectionObserver` would change what those stories
// actually assert, so prefer per-story control over a blanket override here.
