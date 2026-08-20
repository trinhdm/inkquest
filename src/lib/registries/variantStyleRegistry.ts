class VariantStyleRegistry {
	#injected = new Set<string>()

	hasInjected(name: string) {
		if (this.#injected.has(name)) return true
		if (typeof document !== 'undefined' && document.querySelector(`[data-variant-vars="${name}"]`)) {
			this.#injected.add(name)
			return true
		}
		return false
	}

	markInjected(name: string) {
		this.#injected.add(name)
	}

	reset(name?: string) {
		if (name) this.#injected.delete(name)
		else this.#injected.clear()
	}
}

const registry = new VariantStyleRegistry()

export const hasInjectedVariantStyles = registry.hasInjected.bind(registry)
export const markVariantStylesInjected = registry.markInjected.bind(registry)
export const resetVariantStyles = registry.reset.bind(registry)
