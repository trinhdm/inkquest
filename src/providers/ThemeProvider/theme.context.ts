import { createContext } from 'react'
import type { SiteTheme, SiteThemeConfig } from '@/lib/theme'

export const ThemeContext = createContext<(SiteThemeConfig & { config: SiteTheme }) | null>(null)
