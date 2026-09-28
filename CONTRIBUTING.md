# Contributing

## Running the suite

```bash
docker compose up -d
npm ci
npx playwright install chromium firefox webkit
BASE_URL=http://localhost:8081/parabank/ npx playwright test
```

## How a test is written here

1. State the rule, not the click path. A test name says what must be true, for
   example "a transfer moves exactly the stated amount", not "click transfer".
2. Put the selectors in a page object. A spec that contains a CSS selector is a
   spec that breaks when the markup moves.
3. Recompute the number. Never assert that a total equals the total the page
   printed; add the parts up and compare.
4. Never use a fixed pause. Wait for the thing the test needs.
5. A rule this build breaks is marked with `test.fail()` and carries the defect
   id from `docs/defect-reports.md`, with a second test beside it pinning the
   present behaviour.

## Formatting

```bash
npm run format
```

Formatting is checked in continuous integration, so run it before pushing.

## Reporting a defect

Add it to `docs/defect-reports.md` with the same shape as the entries already
there: steps, result, expected, impact, and the test that covers it.
