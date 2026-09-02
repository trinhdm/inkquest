import { addons } from 'storybook/manager-api'
import { inkqDark } from './theme'

// Themes the manager document (sidebar + toolbar). The preview iframe is
// themed separately — see `preview.tsx`'s `docs.theme` and the app's own
// `data-inkq-scheme` attribute.
addons.setConfig({ theme: inkqDark })
