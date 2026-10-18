# Bug: Command palette (Cmd+K) does not index main nav resources

- Severity: Medium
- Area: UI / UX
- Component: Global command palette ("Search or type a command...")

## Steps to reproduce

1. Sign in to the admin console.
2. Click the top search bar or press Cmd+K to open the command palette.
3. Type "users" (or "roles", "sessions", "identities", "registrations").

## Actual result

The palette only lists a fixed set of items: Home, Documentation, Profile,
Settings, Sign out. Typing the name of any primary sidebar resource
(Users, Identities, Roles, Sessions, Registrations) returns
"No results found.", even though these are the main sections of the app
and visible in the sidebar at all times.

## Expected result

The command palette should let users jump to the main resource pages
(Users, Identities, Roles, Sessions, Registrations) by name, matching
what a "search or type a command" affordance implies. At minimum, the
sidebar's own nav items should be indexed as navigation commands.

## Notes

Not a crash, but misleading: the placeholder text promises general search,
while coverage is limited to 4 static items.
