import { createContext } from 'react'
import type { SiteTheme, SiteThemeConfig } from '@/lib/theme/types'

export const ThemeContext = createContext<(SiteThemeConfig & { config: SiteTheme }) | null>(null)
