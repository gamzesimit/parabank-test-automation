/**
 * Amounts the suite uses, named so a reader knows why each one was chosen.
 * Round numbers hide rounding faults, so every figure here carries cents.
 */
export const AMOUNTS = {
  /** A plain transfer, small enough to fit inside the opening balance. */
  ordinary: '25.00',
  /** Carries cents that do not divide evenly, which catches a rounding fault. */
  withCents: '10.37',
  /** Below one cent is not a valid movement of money. */
  belowSmallest: '0.001',
  /** A sign that must never reverse the direction of a transfer. */
  negative: '-50.00',
  /** An empty transaction should not enter the ledger. */
  zero: '0.00',
} as const;

/** The deposit ParaBank takes when a new account is opened. */
export const OPENING_DEPOSIT = 100;
