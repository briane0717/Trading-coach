import { useCallback, useState } from 'react';
import { createAccount, executeOrder, loadAccount, saveAccount } from '../../trading-engine';
import type { Account, Order, OrderResult } from '../../trading-engine';

/**
 * Owns the single paper-trading Account for the app: loads it from localStorage on mount
 * (falling back to a fresh account if nothing valid is stored — see
 * trading-engine/persistence.ts for what counts as valid) and autosaves right after every
 * order that actually executes. There's no account/user model yet (trading-coach-state.md gap
 * #3), so this is deliberately a single account, not one per user.
 *
 * The initial load happens in useState's lazy initializer (not a useEffect) so there's no
 * one-render flash of a fresh $100k account before the real stored one replaces it — same
 * pattern TradingPlanWorksheet.tsx uses for its own localStorage read.
 *
 * Autosave fires after every successfully executed order rather than behind an explicit save
 * action: a filled trade isn't a draft, so there's no meaningful "executed but unsaved" state
 * for the UI to be in. `lastSaveFailed` reflects whether the most recent autosave write itself
 * failed (storage full, private browsing, disabled) — the trade still applies in memory either
 * way; a caller can use this flag to warn that history may not survive a refresh, without
 * blocking the trade UI on it.
 */
export function usePaperAccount() {
  const [account, setAccount] = useState<Account>(
    () => loadAccount(window.localStorage) ?? createAccount()
  );
  const [lastSaveFailed, setLastSaveFailed] = useState(false);

  const submitOrder = useCallback(
    (order: Order): OrderResult => {
      const result = executeOrder(account, order);
      if (result.ok) {
        setAccount(result.account);
        setLastSaveFailed(!saveAccount(window.localStorage, result.account));
      }
      return result;
    },
    [account]
  );

  return { account, submitOrder, lastSaveFailed };
}
