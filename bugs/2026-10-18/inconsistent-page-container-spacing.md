# Bug: Inconsistent outer spacing/alignment across pages (Overview, Profile, Settings vs IAM pages)

- Severity: Medium
- Area: UI / Layout consistency
- Pages affected: `/a` (Overview), `/a/profile` (Profile), `/a/settings` (Settings)
- Pages used as baseline: `/a/auth/users`, `/a/auth/identities`, `/a/auth/roles`,
  `/a/auth/sessions`, `/a/auth/clients` (IAM pages)

## Steps to reproduce

1. Open "Overview" (`/a`) on a wide viewport (desktop).
2. Compare its content position with "Users" (`/a/auth/users`).
3. Open "Profile" (`/a/profile`) and "Settings" (`/a/settings`) and compare
   again.

## Actual result

Each page defines its own outer container instead of relying on a shared
layout spacing convention:

- `HomePage` (Overview): `mx-auto w-full max-w-5xl px-6 py-10 sm:py-14`
- `SettingsPage`: `mx-auto w-full max-w-5xl px-6 py-12 sm:py-16`
- `ProfilePage`: `mx-auto w-full max-w-3xl px-6 py-12 sm:py-16`
- IAM pages (`UsersPage`, `RolesPage`, `SessionsPage`, `IdentitiesPage`,
  `ClientsPage`): just `space-y-6`, no `mx-auto`/`max-w-*`, so content
  starts flush at the top-left of the content area.

Because Overview/Profile/Settings use `mx-auto` with a `max-w-*` cap, their
content is horizontally centered and floats away from the left edge on
wide screens, while every IAM page's content hugs the top-left edge. This
makes the app feel visually inconsistent when navigating between sections:
content position "jumps" between left-aligned and centered depending on
which page is open, and padding amounts also differ (`px-6 py-10/12/14/16`
vs none, since IAM pages rely only on the shared layout's content
spacing).

## Expected result

All pages under the authenticated app shell should start from the same
top-left origin with the same outer spacing, defined once in the shared
layout (e.g. `ProtectedLayout`'s content wrapper) rather than duplicated
ad hoc per page. No page should center itself with `mx-auto max-w-*`
while siblings render flush left — pick one convention (shared padding,
no forced centering/max-width) and apply it consistently, moving any
content-width constraints (e.g. Profile's narrower column) inside the
page using a value that still starts at the same left edge as other
pages.
