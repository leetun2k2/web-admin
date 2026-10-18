# Bug: Clearing the Users search box doesn't restore the list

- Severity: Low
- Area: UI / UX
- Page: `/a/auth/users` (Users)

## Steps to reproduce

1. Go to "Users".
2. Type a search term that matches nothing (e.g. "nonexistentuser123")
   and click "Filter". Table correctly shows "No records found."
3. Clear the search box back to empty (select all + delete).

## Actual result

After clearing the input, the table still shows "No records found." /
"Page 1 of 0 (0 total)" until the user clicks "Filter" again. The empty
search box gives the impression that all users should reappear, but the
stale "no results" state stays until a manual re-filter.

## Expected result

Either re-run the filter automatically when the search box becomes empty,
or make it clearer (e.g. disable/hide the stale empty state, or keep the
"Filter" button visually emphasized) that a manual re-apply is still
required.
