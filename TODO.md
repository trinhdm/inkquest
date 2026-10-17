# TODO

Work left on inkquest. To see how ready each component is, open
**Overview / Component Status** in Storybook
([source](src/stories/overview/ComponentStatus.mdx)).

- Tick a box with `- [x]`, then delete the line once the work is committed. Git history keeps the record.
- Bugs start with **Bug:**.
- Use a `// TODO:` comment in code only for a note about one specific line. If it's real work, add it here too.

## New components

- [ ] CopyButton (`src/components/core/CopyButton/` is empty)
- [ ] Switch (`src/components/form/Switch/` is empty)

## Core

### Button

- [ ] **Bug:** `useCallback` runs after the early `return` for `href`, so a Button that gains or loses `href` crashes ("Rendered more hooks than during the previous render").

### Chip

- [ ] Replace the props copied from FilterBar with Chip's own
- [ ] Wire up `onClick` (commented out today)
- [ ] Add a story

## Data

### Tab

- [ ] Arrow, Home and End key navigation. Until then, keyboard users can only reach the active tab.

## Form

### Field

- [ ] Attach FileUpload as `Field.Upload` once it's ready (commented out in `SUBCOMPONENTS`)
- [ ] **Bug:** a control with `required={ false }` inside `<Field required>` still gets `aria-required="true"`

### FileUpload

- [ ] Move the control id from the wrapper `<div>` to the `<input>`, so the label reaches it
- [ ] Pass `disabled`, `required`, `name` and `onChange` through to the `<input>`
- [ ] Replace the props copied from TextArea (`placeholder`, `readOnly`, `rows`)
- [ ] Build FileUpload.Item (`FileUploadItem/` is empty)
- [ ] Add a story

## Layout

### FilterBar

- [ ] Use `active`, `author` and `onChange` (accepted but ignored today)
- [ ] Add a story

### Grid

- [ ] Finish the `columns` refactor. `Grid.test.tsx` has 1 failing test.
- [ ] **Bug:** a negative `columns` gives `repeat(-2, minmax(0, 1fr))` instead of falling back to `auto-fit`. This is the failing test.
- [ ] **Bug:** a string `columns` like `'1fr 2fr'` gets `minmax(0, 1fr)` added to it. With the default `equalWidth` it's also wrapped in `repeat()`, which isn't valid CSS.
- [ ] **Bug:** `equalWidth={ false }` drops `repeat()` and gives `2 minmax(0, 1fr)`, which isn't valid CSS

### Group

- [ ] **Bug:** `values.unstyled: false` should override the group's own `unstyled`. Today only `true` is checked (`keyHasValue(values, { unstyled: true })`).

### Sidebar

- [ ] Build Sidebar.Area (`SidebarArea/` is empty), or delete the folder
- [ ] Finish the `it.todo` in `Sidebar.test.tsx`: the rail shouldn't sit above the list when no item is active

## Document

### StyleInliner

- [ ] `ThemeStyleInliner/` and `VariantStyleInliner/` are empty folders, and `VariantStyleInliner.tsx` sits next to `StyleInliner.tsx`. Move the files in, or delete the folders.

## Cleanup

- [ ] The category `index.ts` files (`core/`, `data/`, `layout/` and so on) are empty. Add exports or delete them.

## Outside components

- [ ] **Bug:** `src/utils/helpers/checks/links.ts`: `startsWith('/')` makes `//other-host` links count as internal, so the `sameProtocol` check never runs
- [ ] **Bug:** `src/hooks/useParser/useParser.tsx` checks `instanceof Text` without importing `Text` from `html-react-parser`. Emails in text stay unlinked, and the server render throws.
- [ ] **Bug:** `src/utils/helpers/format/date.ts`: the output follows the input's key order, so `{ year, day, month }` gives `March 2024 5,`. It should always be `March 5, 2024`.
- [ ] **Bug:** `src/lib/theme/reference/api.ts`: `presets.motion()` and `presets.text.section()` accept zero arguments and point at CSS variables that are never emitted. No caller does this yet.
- [ ] **Bug:** the `(user)` layout wraps pages in `<main>`, and `/signup`, `/profile`, `/settings` and `/messages` add their own, so those pages have two
- [ ] **Bug:** the `/login` form has no submit handler or `method`, so submitting puts the password in the URL
- [ ] `/login`: "Forgot password?" is a plain caption, not a link
- [ ] **Bug:** the `/press` email link is missing `mailto:`
- [ ] **Bug:** the `/support` Artist tab has two `defaultChecked` radios, and a `value="verificatio"` typo
- [ ] `src/app/(company)/support/_utils/support.data.ts` is unused. Use it or delete it.
