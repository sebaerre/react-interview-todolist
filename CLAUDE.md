# Todo List App — Codebase Reference

## Stack

- **React 19** + TypeScript ~5.7
- **Tailwind CSS v4** via `@tailwindcss/vite` — no `tailwind.config.ts`; all design tokens live under `@theme` in `src/index.css`
- **React Query v5** (`@tanstack/react-query`) for all server state
- **framer-motion v12** for layout animations (task reordering, checkbox spring)
- **classnames** for conditional class merging in components
- **sonner** for toast notifications (`toast.success` / `toast.error`)
- **DM Sans** (400/500/600) + **DM Mono** (400/500) loaded via `<link>` in `index.html` from Google Fonts

## Color System

All tokens are CSS custom properties declared in the `@theme` block in `src/index.css`. Tailwind v4 maps them automatically to utility classes.

**Rule:** No hex values, `rgb()`, or `rgba()` in any component file. No raw Tailwind scale classes (e.g. `border-gray-200`, `bg-neutral-800`). Every class must reference a token from the table below.

| CSS variable | Tailwind utility | Value | Usage |
|---|---|---|---|
| `--color-primary` | `bg-primary` | `#111110` | Sidebar background, button base |
| `--color-primary-hover` | `bg-primary-hover` | `#1c1c1a` | Sidebar item hover |
| `--color-primary-active` | `bg-primary-active` | `#1e1e1c` | Selected sidebar item |
| `--color-primary-divider` | `border-primary-divider` | `#2a2a28` | Sidebar borders and dividers |
| `--color-on-primary` | `text-on-primary` | `#e8e6df` | Primary text on dark surfaces |
| `--color-on-primary-muted` | `text-on-primary-muted` | `#888880` | Inactive / secondary text |
| `--color-on-primary-subtle` | `text-on-primary-subtle` | `#555550` | Monospace IDs, done/total count |
| `--color-panel-bg` | `bg-panel-bg` | `#1a1917` | Main panel background |
| `--color-panel-divider` | `border-panel-divider` | `rgba(255,255,255,0.07)` | Task row separators |
| `--color-tertiary` | `bg-tertiary` | `rgba(48,48,46,1)` | Add-task row hover |
| `--color-tertiary-border` | `border-tertiary-border` | `#3a3a38` | Unchecked checkbox border |
| `--color-accent` | `bg-accent` / `border-accent` | `#c9b87a` | Amber: active bar, checked checkbox, progress fill |
| `--color-btn-primary` | `bg-btn-primary` | `#111110` | "Complete all" button background |
| `--color-btn-primary-text` | `text-btn-primary-text` | `#d8d5cc` | "Complete all" button text |
| `--color-btn-primary-hover` | `bg-btn-primary-hover` | `#222220` | "Complete all" button hover |
| `--color-status-green-{bg,text,border}` | `bg/text/border-status-green-*` | green tones | `done` badge |
| `--color-status-yellow-{bg,text,border}` | `bg/text/border-status-yellow-*` | yellow/amber tones | `syncing` badge |
| `--color-status-gray-{bg,text,border}` | `bg/text/border-status-gray-*` | gray tones | `pending` badge |
| `--color-status-red-{bg,text,border}` | `bg/text/border-status-red-*` | red tones | Delete button hover text |

## Layout

- `Dashboard/index.tsx` — full-viewport `h-screen overflow-hidden` flex row
- **Sidebar** — `w-[280px] shrink-0 h-full` dark panel (`bg-primary`), `<aside>` element
- **Main panel** — `flex-1 overflow-hidden` two-column flex layout (`TodoPanel` left + `RightPanel` right)
- Each panel scrolls independently via `overflow-y-auto` on its inner scroll container

## TypeScript Interfaces — `src/types.ts`

```ts
export enum TodoStatus {
  Pending = "Pending",
  Done    = "Done",
  Syncing = "Syncing",
}

export interface TodoList {
  id:   string;
  name: string;
}

export interface TodoItem {
  id:       number;
  todoList: string;   // the parent list's ID
  name:     string;   // task label
  done:     boolean;
}

/** Streaming payload emitted by the server for each item marked done during a complete-all operation. */
export interface CompleteAllProgressEvent {
  itemId:    number;
  completed: number;
  total:     number;
}
```

## Component Structure — `src/components/`

All components use a folder-per-component layout (`ComponentName/index.tsx`). Sub-components that belong exclusively to a parent live inside that parent's folder. A barrel `src/components/index.ts` re-exports every public component.

| Component | Responsibility |
|---|---|
| `App.tsx` | `QueryClientProvider` + `<Toaster>` (sonner) wrapper; renders `<Dashboard>` |
| `Dashboard/` | Owns `selectedId` state; auto-selects first list on load; renders `<Sidebar>` + `<TodoPanel>` or `<DashboardEmptyState>` |
| `Sidebar/` | List nav + delete list; delegates creation to `CreateTodoList` |
| `Sidebar/CreateTodoList/` | Inline form (collapsed to "+ New list" button) for creating a list; uses `InlineInput` + `useCancelEdit` |
| `ListNavItem/` | Single sidebar row; fetches items when active to compute `done/total`; shows `StatusBadge` when all done |
| `TodoPanel/` | Orchestrates the complete-all streaming flow; renders header, item list, add-item row, and right panel |
| `TodoPanel/TodoListPanelHeader/` | List title (inline-editable) + `ProgressBar` + "Completed!" badge |
| `TodoPanel/TodoListPanelHeader/TodoListEditForm/` | Inline rename form for a list; uses `InlineInput`, `useCancelEdit`, `useUpdateTodoList` |
| `TodoPanel/TodoItemsList/` | `framer-motion` layout-animated list of `TodoItemRow` components |
| `TodoPanel/RightPanel/` | "N todos remaining" counter + "Complete all" button + loading spinner |
| `TodoItemRow/` | Checkbox toggle + label + edit button + delete button + `StatusBadge`; switches to `EditTodoItemForm` when editing |
| `TodoItemRow/AddTodoItem/` | Collapsed "+ Add todo" button that expands to `CreateTodoItemForm` |
| `TodoItemRow/CreateTodoItemForm/` | Inline form for creating a new todo item |
| `TodoItemRow/EditTodoItemForm/` | Inline form for renaming an existing todo item; uses `useCancelEdit` |
| `TodoItemRow/TodoItemLabel/` | Task label text with animated strikethrough when done |
| `ProgressBar/` | Pure display: progress bar fill + `completed / total` monospace count |
| `Checkbox/` | Animated spring checkbox using `framer-motion`; accepts `checked` prop |
| `InlineInput/` | Accessible `<label>` + `<input>` pair; label is visually hidden by default (`sr-only`); forwards `aria-label`, `aria-invalid`, and `aria-describedby` |
| `StatusBadge/` | Pill badge for `Pending \| Done \| Syncing`; accepts optional `className` and children |
| `Button/` | Thin `<button>` wrapper with `classnames` merging |
| `Spinner/` | CSS spin ring; accepts `size` (default 32) and `label` (default `"Loading"`) props; uses `@theme` tokens |
| `DashboardEmptyState/` | Rendered when no list is selected |

## Hooks — `src/hooks/`

Each hook lives in its own folder (`hooks/useXxx/index.ts`). A barrel `src/hooks/index.ts` re-exports all hooks.

Mutation hooks delegate to `useMutationWithNotification`, which wraps React Query's `useMutation` and automatically fires a `sonner` toast on success or error.

| Hook | Purpose | Cache effect |
|---|---|---|
| `useGetTodoLists` | `GET /api/todolists` | `staleTime: Infinity` |
| `useGetTodoItems(id, enabled)` | `GET /api/todolists/:id/todoitems` | `staleTime: Infinity`; only fetches when `enabled` is `true` |
| `useCreateTodoItem({ listId })` | `POST /api/todolists/:id/todoitems` | `invalidateQueries` items |
| `useUpdateTodoItem({ listId })` | `PUT /api/todoitems/:id` | Optimistic `setQueryData` on items cache |
| `useDeleteTodoItem({ listId })` | `DELETE /api/todoitems/:id` | `invalidateQueries` items |
| `useCreateTodoList()` | `POST /api/todolists` | `invalidateQueries` lists |
| `useUpdateTodoList()` | `PUT /api/todolists/:id` | Optimistic `setQueryData` on lists cache |
| `useDeleteTodoList()` | `DELETE /api/todolists/:id` | `invalidateQueries` lists + `removeQueries` items |
| `useCompleteAll({ listId, onProgress, onDone, onError })` | Streaming `POST /api/todolists/:id/complete-all`; returns `{ progress, isPending, trigger, cancel }` | Caller applies progress events directly to cache via `setQueryData` |
| `useMutationWithNotification(opts)` | Wraps `useMutation`; shows `toast.success`/`toast.error`; supports static or factory message strings | N/A — base primitive |
| `useTodoPanelStats(items)` | Derives `{ sortedItems, done, total, remaining, allDone }` from a flat item array | Pure computation; no network |
| `useCancelEdit(ref, handleCancel)` | Closes edit mode on outside click or Escape key; returns `{ handleKeyDown }` to spread on the input | N/A — UI utility |

## API — `src/api/`

The API layer is split across four files:

| File | Contents |
|---|---|
| `client.ts` | `apiFetch<T>` — fetch wrapper that throws on non-2xx; `json(body)` — builds `Content-Type: application/json` `RequestInit` |
| `queryKeys.ts` | `qk` — shared React Query key factory: `qk.lists()` → `["todolists"]`, `qk.items(id)` → `["todoitems", id]` |
| `todolists.ts` | `fetchTodoLists`, `fetchTodoItems`, `createTodoList`, `createTodoItem`, `deleteList`, `updateList`, `completeAll` |
| `todoitems.ts` | `deleteItem`, `updateItem` |

The Vite dev server proxies `/api` → `http://host.docker.internal:3000`.

`completeAll` uses a **streaming NDJSON** response (`POST /api/todolists/:id/complete-all`). It reads the response body via `ReadableStream` + `TextDecoderStream`, parses each newline-delimited JSON line, and calls `onProgress` for each `CompleteAllProgressEvent`. An `AbortSignal` is forwarded to allow mid-stream cancellation.

## Icons — `src/icons/`

Inline SVG components with `size` and `label` props (typed via `src/icons/types.ts`). All SVG attributes use camelCase (`strokeWidth`, `strokeLinecap`, `strokeLinejoin`). A barrel `src/icons/index.ts` re-exports all icons.

| Icon | Usage |
|---|---|
| `Checkmark` | Checkbox fill; save-button affordance |
| `Delete` | Delete button in `TodoItemRow` and `ListNavItem` |
| `EmptyList` | Illustration in `DashboardEmptyState` |
| `Pencil` | Edit-name button in `TodoItemRow` and `TodoListPanelHeader` |

## Known Bugs

None outstanding — all previously tracked bugs have been resolved.

## Testing

Run unit tests with `npm run test:unit`. Test files live alongside their component (e.g. `src/components/Button/index.test.tsx`).

### Guidelines

- **Test real behavior, not implementation details** — assert what the user sees and can interact with, not internal state or hook internals.
- **Query through the public UI** — use roles, labels, and visible text (`getByRole`, `getByLabelText`, `getByText`). Scope assertions with `within()` when the same text appears in multiple regions.
- **Use `userEvent` over `fireEvent`** — `userEvent` simulates real browser interactions; prefer it for clicks, typing, and keyboard events.
- **Always mock network requests** — all tests call `vi.mock('../../api')` (or the appropriate relative path). The manual mock at `src/test/apiMock.ts` keeps `qk` real so React Query cache keys stay unique; only the fetch functions are replaced with `vi.fn()`.
- **Mock other dependencies only when necessary** — framer-motion is globally mocked in `src/test/setup.ts` to avoid animation timing issues; don't add further mocks without a clear reason.
- **Arrange / Act / Assert** — structure each test with a clear setup phase, a single action, and focused assertions.
- **Use exact name matches for role queries** — prefer `getByRole('button', { name: 'Save' })` over regex `/Save/`; a regex matches multiple elements when other buttons share the substring (e.g. "Save" vs "Save and close").
- **Seed the React Query cache instead of mocking hooks** — call `qc.setQueryData(qk.items(id), [...])` before rendering, then pass `qc` to `renderWithClient`. This tests the real hook behaviour without reaching the network.

### Test utilities (`src/test/utils.tsx`)

| Export | Purpose |
|---|---|
| `createQueryClient()` | Creates a `QueryClient` with `retry: false` for both queries and mutations |
| `renderWithClient(ui, qc?)` | Wraps `ui` in `QueryClientProvider`; returns RTL result + `queryClient` |
| `renderHookWithClient(hook, qc?, options?, initialData?)` | Same wrapper for `renderHook`; optional `initialData` array pre-seeds the cache via `setQueryData` before render |

## Coding Conventions

- **No hex/rgb in components** — all color via `@theme` tokens (see Color System table)
- **No raw Tailwind scale classes** — never `bg-gray-*`, `border-neutral-*`, etc.
- **Semantic HTML for interactive elements** — use `<button>` not `<div role="button">`; use `<label>` or `aria-label` on every input
- **camelCase SVG props** — `strokeWidth`, `strokeLinecap`, `strokeLinejoin`, not hyphenated
- **Inline styles only for dynamic values** — e.g. `style={{ width: \`${pct}%\` }}` in ProgressBar is acceptable
- **No code duplication** — shared logic (helpers, utilities, types) must be extracted to a dedicated importable module; never copy-paste code between files
