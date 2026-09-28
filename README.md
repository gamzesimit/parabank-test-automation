# ParaBank test automation

A Playwright suite for a retail online banking application, written around the
rules that protect the balance rather than around the screens.

Four defects were found, three of them reproducible on every attempt. Two of them
change the balance of an account: a bill payment larger than the available balance
is accepted and drives the account to -1000.00, and a bill payment entered as a
negative amount pays money into the account instead of out of it.

Reports: [docs/defect-reports.md](docs/defect-reports.md)
Plan and reasoning: [docs/test-plan.md](docs/test-plan.md)

## Running it

The suite runs against a local container, so results do not depend on a shared
public environment.

```bash
docker compose up -d          # starts ParaBank on http://localhost:8081
npm ci
npx playwright install chromium
BASE_URL=http://localhost:8081/parabank/ npx playwright test
```

Report:

```bash
npx playwright show-report
```

## What is covered

| File | Area |
|---|---|
| `tests/01-registration.spec.ts` | Registration, sign out and back in, wrong password |
| `tests/02-accounts.spec.ts` | Opening an account, funding deposit, overview total against the sum of rows |
| `tests/03-transfers.spec.ts` | Transfer amounts, cents, above balance, negative, zero |
| `tests/04-billpay.spec.ts` | A payment inside the balance leaves the account exactly |
| `tests/05-money-rules.spec.ts` | The rules this build breaks, each tied to a defect id |

Fifteen tests. Three of them are marked as expected failures with `test.fail()`
and carry the defect id they belong to, so the suite stays green while the
defects stay visible. When a defect is fixed the mark is removed and the test
turns into a regression guard.

## Structure

```
pages/        page objects, one per screen, all extending BasePage
fixtures/     test data builders, unique per run so tests never collide
tests/        specs grouped by area
docs/         test plan and defect reports
```

`BasePage.gotoStable` retries a navigation while the server answers with its
internal error page. That exists because of PB-001 and is documented rather than
hidden, so nobody later mistakes a retry for flakiness in the tests.

## Continuous integration

`.github/workflows/tests.yml` starts the same container as a service, waits for
it to answer, runs the suite on every push and pull request, and keeps the HTML
report as an artifact for fourteen days.

## Next steps

- Cover the loan request and find transactions screens.
- Cover the REST API, where the same amount rules can be checked without a browser.
- Add Firefox and WebKit to the project list.
