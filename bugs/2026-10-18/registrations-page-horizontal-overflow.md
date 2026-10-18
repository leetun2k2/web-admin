# Bug: Registrations page overflows horizontally, hiding actions

- Severity: High
- Area: UI / Layout
- Page: `/a/auth/clients` (Registrations)
- Viewport tested: 1512x806 (desktop, no zoom)

## Steps to reproduce

1. Sign in to the admin console.
2. Go to "Registrations" in the sidebar.
3. Observe the page at normal desktop width.

## Actual result

The table (Provider, Client ID, Name, Callback URL, Approved Redirects,
Status, Actions) is wider than the viewport. There is no `overflow-x:auto`
wrapper around the table, so the whole page body scrolls horizontally
instead of just the table.

Effects:
- The "Register OAuth Client" button is clipped at the right edge
  ("Register OAu...").
- The pagination "Next" button is clipped ("Nex").
- The "Actions" column (view / enable-disable) is pushed off-screen and
  only reachable by scrolling the entire page horizontally.
- Scrolling horizontally also drags the top header bar (logo, search,
  user menu) and the page title out of view, which breaks the app-shell
  layout (sidebar is the only part that stays fixed).

This happens at a normal desktop width (1512px), not just small screens.

## Expected result

Per the page's own layout convention (other list pages bound tables in a
scrollable container), the table should sit inside its own
`overflow-x: auto` container so the page body never scrolls horizontally.
Primary actions (Register OAuth Client, pagination, row actions) must stay
reachable without scrolling the whole page.

## Notes

Other list pages (Users, Identities, Roles, Sessions) do not show this
issue because they have fewer/narrower columns. Registrations has more
columns (Callback URL, Approved Redirects) and is the one that breaks.
