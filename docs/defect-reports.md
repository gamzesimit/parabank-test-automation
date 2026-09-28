# Defect reports

Application under test: ParaBank (Parasoft), `parasoft/parabank:latest`, run locally.
Browser: Chromium via Playwright. Tested September 2026.

Each report states what was done, what the application did, what a banking
application is required to do instead, and why it matters in money terms.

---

## PB-002 — A bill payment larger than the balance is accepted and drives the account negative

**Severity:** High
**Area:** Bill Pay
**Status:** Reproducible on every attempt

**Steps**

1. Register a new customer. The opening account holds 515.50.
2. Go to Bill Pay.
3. Fill in any payee and enter 1515.50 as the amount.
4. Choose the opening account and send the payment.
5. Go to Accounts Overview.

**Result**
The payment is accepted. The balance becomes -1000.00. No warning is shown
before or after, no overdraft fee is raised, and no approval is requested.

**Expected**
The payment is refused with a message naming the available balance, or it is
accepted under a declared overdraft arrangement with a recorded fee. A retail
banking product does not let a customer spend money it does not hold in silence.

**Impact**
Every account can be driven negative by any amount a customer types. There is no
ceiling: the same steps with 10,000,000.00 also succeed. In a real deployment
this is an uncontrolled credit line.

**Covered by** `tests/05-money-rules.spec.ts`, "a bill payment above the
available balance must be refused".

---

## PB-003 — A bill payment with a negative amount pays money into the account

**Severity:** High
**Area:** Bill Pay
**Status:** Reproducible on every attempt

**Steps**

1. Register a new customer. The opening account holds 515.50.
2. Go to Bill Pay.
3. Enter -250.00 as the amount and send the payment.
4. Go to Accounts Overview.

**Result**
The payment is accepted and the balance rises to 765.50. The customer has gained
250.00 by typing a minus sign.

**Expected**
The amount field rejects anything at or below zero before the request is sent,
and the server refuses the same value independently of the browser.

**Impact**
This creates money out of nothing. It is worse than PB-002 because the customer
ends up better off, so nothing in the account statement looks like an error to
the customer, and reconciliation against the bill payment ledger will not match.

**Covered by** `tests/05-money-rules.spec.ts`, "a bill payment with a negative
amount must be refused, not credited".

---

## PB-004 — A transfer with a negative amount fails silently

**Severity:** Medium
**Area:** Transfer Funds
**Status:** Reproducible on every attempt

**Steps**

1. Register a new customer.
2. Go to Transfer Funds.
3. Enter -250.00 and submit.

**Result**
Nothing happens. The form is redisplayed with no confirmation and no error. The
balance is unchanged, which is the correct outcome, but the customer is not told
that the request was rejected or why.

**Expected**
A validation message next to the amount field, in the same place the application
shows other field errors.

**Impact**
Lower than PB-002 and PB-003 because no money moves. It still matters: a customer
who believes a transfer went through will not repeat it, and a support team has no
error to trace.

**Covered by** `tests/05-money-rules.spec.ts`, "a transfer with a negative amount
must show an error".

---

## PB-001 — The public demo returns an internal error on Open New Account about half the time

**Severity:** High on the public demo, not reproducible on a local container
**Area:** Open New Account
**Status:** Intermittent, measured

**Steps**

1. Register a new customer on `parabank.parasoft.com`.
2. Go to Open New Account.

**Result**
The page returns "An internal error has occurred and has been logged." and the
account type field never renders, so no account can be opened. Measured over ten
fresh browser sessions: five failed, four succeeded, one session failed earlier
during registration.

Running the same build locally from `parasoft/parabank:latest` did not reproduce
the error in any of fifteen runs, which points at the hosted environment rather
than the application code.

**Expected**
The page renders the form, or it explains what went wrong and what to do next.

**Impact**
On the public demo a new customer cannot complete the main task of the product.
For an automated suite it means every test that opens an account is unreliable,
which is why the page objects in this repository retry through
`BasePage.gotoStable` and why the suite runs against a local container.

**Covered by** `pages/BasePage.ts`, `gotoStable`.
