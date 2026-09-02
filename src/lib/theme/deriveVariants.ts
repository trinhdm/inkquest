import { toKebabCase } from '@/utils/helpers'
import type { CssRule, SiteThemeConfig, VariantTokens } from './types'

type BridgeSlot = keyof VariantTokens            // 'background' | 'border' | 'color'
type BridgeState = 'hover' | 'active' | 'disable' | 'focus' | 'press' | 'select'

export interface VariantBridge {
	name: string
	slots?: BridgeSlot[]
	states?: BridgeState[]
}

const DEFAULT_SLOTS: BridgeSlot[] = ['background', 'border', 'color'],
	DEFAULT_STATES: BridgeState[] = ['hover']

// Single source of truth for the `--variant-* -> --<component>-*` bridge.
// Static per component: no prop values, no per-instance theme values other
// than `theme.prefix`, so this runs once at SSR time (VariantStyleInliner)
// instead of once per render. Adding a variant-aware component is a
// one-line entry in `variantBridges.ts`, never a copy of this function.
export const deriveVariants = (
	{ name, slots = DEFAULT_SLOTS, states = DEFAULT_STATES }: VariantBridge,
	theme: SiteThemeConfig
): CssRule => {
	const ns = toKebabCase(name),
		vars: Record<string, string> = {}

	for (const slot of slots) {
		vars[`--${ns}-${slot}`] =
			`var(--variant-${slot}, var(--${theme.prefix}-${slot}-backup))`

		// Fallback routes through the component's OWN base var
		// (`--${ns}-${slot}`), not back through `--variant-${slot}` — a
		// per-instance `style={{ '--button-background': ... }}` override is
		// now honored on hover too, not just at rest. This is the fix for
		// Finding: "Hover fallback bypasses per-instance overrides".
		for (const state of states)
			vars[`--${ns}-${slot}-${state}`] =
				`var(--variant-${slot}-${state}, var(--${ns}-${slot}))`
	}

	return { selector: theme.prefixSelector(name), vars }
}
