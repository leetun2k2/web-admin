# Bug: Read-only Profile fields look identical to editable fields

- Severity: Low
- Area: UI / UX
- Page: `/a/profile` (Profile)

## Steps to reproduce

1. Go to "Profile".
2. Compare the "User ID" and "Email" fields with "Display Name" and
   "Avatar URL".
3. Click into "User ID" and try typing.

## Actual result

"User ID" and "Email" are read-only (typing has no effect), but they are
rendered with the same border, background, and focus-ring style as the
editable "Display Name" and "Avatar URL" fields. There is no visual cue
(disabled background, lock icon, helper text) indicating they cannot be
edited until the user actually tries typing into them.

## Expected result

Read-only fields should be visually distinguishable from editable ones
(e.g. muted/disabled background, reduced opacity, or a "read-only" label)
so users don't attempt to edit identity fields that will silently reject
input.
