/**
 * Chapter-provided judges for questions whose answer is "a number that
 * satisfies a condition" (for example, a counterexample). Content stays
 * data: a question names a judge by id and the chapter registers the function.
 */

import { createContext, useContext } from 'react';
import type { JudgeRegistry } from '../../engine/education/types';

const JudgeContext = createContext<JudgeRegistry>({});
export const JudgeProvider = JudgeContext.Provider;
export const useJudges = (): JudgeRegistry => useContext(JudgeContext);
