# Bug: Delete Role dialog gives no warning when role is in use

- Severity: High
- Area: UI / UX (confirmation dialog content)
- Page: `/a/auth/roles` (Roles)

## Steps to reproduce

1. Go to "Roles".
2. Note the "admin" role shows "Users Assigned: 1".
3. Click the delete (trash) icon on the "admin" row.

## Actual result

The dialog only shows a generic message:
"Are you sure you want to delete this role? This cannot be undone."
plus the role name/key. It does not mention that the role currently has
1 user assigned, nor does it block/require extra confirmation for a role
that is in use. The same generic dialog appears regardless of whether
"Users Assigned" is 0 or greater than 0.

## Expected result

When a role has one or more users assigned, the confirmation dialog
should surface that fact (e.g. "This role is assigned to 1 user(s).
Deleting it will remove their access.") and ideally require a stronger
confirmation step, since this list currently includes the only admin
account and deleting it could lock out all administrators.

## Notes

Did not confirm the deletion (too destructive to test against the only
admin user in this environment). This is purely about the dialog's
messaging/safeguards, not a confirmed data-loss repro.
