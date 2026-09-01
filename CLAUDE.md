# Frontend conventions (Inertia + React + TypeScript)

These rules exist to stop the admin CRUD pages (products, employees, clients,
materials, expenses, assets, categories, units, ...) from re-inventing
the same label/input/button markup in every `index.tsx`. Use the shared
components below instead of raw HTML — they're already built and already used
across the app.

## Forms

- **Labels** — use `FormLabel` (`@/components/ui/form-label`) for standalone
  labels (next to a `<select>`/`<textarea>`/custom control), or the `label`
  prop on `FormInput` for text/number/date inputs. Pass `required` to either
  and it renders the red `*` automatically via `RequiredMark`
  (`@/components/ui/required-mark`) — never hand-write
  `<span className="text-red-500">*</span>` again. Only mark a field required
  if the backend Form Request actually validates it as `required`
  (`required_if` fields count only while their condition is active) — don't
  guess.
- **Inputs** — use `FormInput` (`@/components/ui/form-input`) for text/number/
  date/email fields. It wraps `Input`, renders the label + required mark +
  error message, and accepts a `className` override (merged via `cn`/
  `tailwind-merge`, so passing e.g. `rounded-xl border-neutral-200
  bg-transparent` cleanly overrides the shadcn default look — no need to
  fight the base classes).
- **Selects** — use `FormSelect` (`@/components/ui/form-select`) for
  create/edit-form dropdowns. Same restyled look as `FilterSelect` (rounded
  border, chevron indicator, optional leading `icon`), but with `FormInput`-
  style `label`/`required`/`error`/`helperText` props — don't hand-write a raw
  `<select>` + separate `<label>`/error `<p>` for form fields anymore. List-page
  filter bars keep using `FilterSelect` (`@/components/ui/filter-select`)
  as-is; that one's a different shape (no label/error, just an icon + the
  select) meant for the `DataView` filters slot, not form fields.
- **Submit buttons** — use `FormButton` (`@/components/ui/form-button`) with
  `loading={processing}`. It disables itself and swaps in a spinner
  automatically; don't hand-roll an inline `<svg className="animate-spin">`
  or a second `disabled={processing}` button. Prefer swapping the button text
  to `processing ? 'Saving...' : ...` too, so the loading state is visible
  even without looking at the spinner.
- **Confirm-modal submits** (`SaveConfirmationModal`, `DeleteConfirmationModal`)
  already show `isProcessing`-driven text/disabled state — don't duplicate
  that inside the modal body.

## Sidebar

`app-sidebar.tsx` groups resources under named `NavGroup`s (Overview, Sales,
Catalog, Team, Finance) with collapsible sub-menus for multi-page resources
(Products, Employees, Clients, Expenses, Assets). Keep sub-items plain text —
no `+`/`Plus` icon, no quick-create shortcuts; "Add X" happens from the
resource's own index page, not the sidebar. Active-state matching
(`nav-main.tsx`) strips the origin before comparing, because Ziggy's `route()`
returns absolute URLs while Inertia's `page.url` is relative — compare paths,
never the raw strings.

## General

- Don't duplicate a component that already exists under
  `resources/js/components/ui/` — check there first.
- If you're about to copy a block of JSX (label+input+error, or a spinner
  button) from one page into another, that's the signal to use the shared
  component instead, not to paste it.
