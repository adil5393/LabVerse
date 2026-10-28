/**
 * Compatibility switch for the older Circles guided-workbench path (see `features/education/compat.ts`). Kept as its own module
 * so existing imports and the earlier flag key (`labverse.compat.legacyCirclesPath`) keep working.
 */

import { legacyPathEnabled } from '../../education/compat';

export const LEGACY_CIRCLES_FLAG = 'labverse.compat.legacyCirclesPath';

export const legacyCirclesPathEnabled = (search?: string): boolean => legacyPathEnabled('circles', search, [LEGACY_CIRCLES_FLAG]);
