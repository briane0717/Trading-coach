import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// vitest.config's `test.globals` is left off (the project uses explicit imports elsewhere), so
// Testing Library's own auto-cleanup — which only self-registers when it detects `afterEach` as
// a global — never fires. Do it explicitly so each test starts from an empty DOM.
afterEach(() => {
  cleanup();
});
