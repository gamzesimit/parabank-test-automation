# Test plan

## What is under test

ParaBank, a retail online banking application: customer registration, account
opening, funds transfer between own accounts, bill payment, and the accounts
overview that reports balances.

## What this plan covers

The money. Every test in this repository answers one of three questions:

1. Does the stated amount move, to the cent?
2. Does the total across accounts stay whole when money moves between them?
3. Does the application refuse an amount a bank is required to refuse?

Screens, wording and layout are out of scope unless a defect hides behind them.

## Why these cases

The risk in a banking product is not that a page fails to load. It is that a page
loads, reports success, and the ledger is wrong. The cases below were chosen
because each one has a single correct arithmetic answer that can be checked
without knowing anything about the implementation.

| Case | Rule under test | Why it matters |
|---|---|---|
| Open an account | The opening deposit leaves the funding account and arrives in the new one | A deposit that is debited twice, or not at all, is a reconciliation break on day one |
| Overview total | The printed total equals the sum of the rows | A total computed separately from the rows can drift |
| Transfer, round amount | Exactly the amount leaves one account and arrives in the other | The basic double entry rule |
| Transfer, amount with cents | 10.37 moves as 10.37, not 10.00 or 10.40 | Rounding errors accumulate silently across thousands of transactions |
| Transfer, above balance | Refused | A customer cannot spend money it does not hold |
| Transfer, negative | Refused, with a message | A minus sign must not reverse the direction of money |
| Transfer, zero | Refused | An empty transaction should not enter the ledger |
| Bill payment, inside balance | Exactly the amount leaves the account | The basic case |
| Bill payment, above balance | Refused | See PB-002 |
| Bill payment, negative | Refused | See PB-003 |

## Boundary values

For every amount field: a negative value, zero, a value one cent below the
balance, the exact balance, and a value one cent above it. Amounts with cents are
used throughout rather than round numbers, because round numbers hide rounding
faults.

## What is deliberately not covered

- Load and performance. The environment is a single container and any number
  measured on it would not transfer to a real deployment.
- Security testing. It is a separate discipline and a separate report.
- Cross browser. The suite runs on Chromium. Adding Firefox and WebKit is a
  configuration change, not a new test, and is listed under next steps.

## Known gaps

- The loan request flow is not covered yet.
- The find transactions screen is not covered yet.
- The REST API that ParaBank exposes is not covered yet. It is the natural next
  piece, because the same rules can be checked there without a browser.

## How defects were judged

A finding is reported when it changes a balance, hides a failure from the
customer, or would break a reconciliation. Anything that is only a wording or
layout preference was left out.
