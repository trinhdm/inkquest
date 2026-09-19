class VariantStylesRegistry {
	#list = new Set<string>()

	check(name: string) {
		if (this.#list.has(name)) return true
		if (typeof document !== 'undefined' && document.querySelector(`[data-target-vars="${name}"]`)) {
			this.#list.add(name)
			return true
		}
		return false
	}

	mark(name: string) {
		this.#list.add(name)
	}

	reset(name?: string) {
		if (name) this.#list.delete(name)
		else this.#list.clear()
	}
}

const registry = new VariantStylesRegistry()

export const hasInjectVariant = registry.check.bind(registry)
export const markInjectVariant = registry.mark.bind(registry)
export const resetVariantStyles = registry.reset.bind(registry)
