# EDU-1P Audit: Propositions and Their Converses

Baseline: commit `fbe0fcf`. Written before any implementation.
Evidence labels as in EDU-1: **Observed** (reproduced by running code or a test), **Suspected** (read, not reproduced).

## 0. What the chapter actually is

The repository says "Class 9 NCERT Ganita Manjari: Propositions and Their Converses". I checked the textbook itself rather than the repository's description. It is **Grade 9, Part II, Chapter 9** (`iemh201.pdf`, 7 pages; the Part I/II table of contents confirms the title and page range).

What the textbook chapter contains (read from the PDF text):

| Part | Content |
|---|---|
| Opening | Statement 1 (equal sides give equal angles) and Statement 2 (equal angles give equal sides). "A statement that is either true or false is called a proposition." "If X then Y", "X implies Y". Statement 2 is the **converse** of Statement 1. |
| Think and Reflect | Is a true proposition's converse always true? Prove Statement 2 (hint: draw the altitude from the third vertex). |
| Example 1 | Rain and a wet road. A true proposition with a false converse. A counterexample is "a situation that illustrates why a given proposition is not necessarily true". |
| Fermat and Euler | Fermat claimed `2^(2^n) + 1` is always prime; Euler showed `2^(2^5) + 1` is composite. Finding a counterexample is "a short and convincing way" to show a proposition is false. |
| Example 2 | Multiple of 6 gives multiple of 3, and its converse. |
| Example 3 | A perfect square has an odd number of factors, and the converse. The **factor-partner argument**, and a careful discussion of *which* direction the argument proves. |
| Example 4 | Equal area gives congruent, and its converse. |
| Think and Reflect | Both the proposition and its converse can be false: give an example. |
| Example 5 | The Baudhāyana–Pythagoras theorem and its converse, proved with a second right triangle and SSS congruence. |
| A Note | "Y when X" has the same meaning as "if X then Y". |
| Exercise Set 9.1 | Questions 1 to 17 (frame the converse, decide truth, justify or give a counterexample; non-prime-generating expressions; divisibility; the two-sticks quadrilateral question). |
| Summary | Four bullets: proposition, converse, the four truth combinations, counterexamples. |

The chapter has **no numbered sections** (Chapter 9 has Examples 1 to 5 and Exercise Set 9.1).

## 1. Existing lesson coverage

12 lessons in 6 units (`curriculumPath.ts`), 12 experiments, 5 workbench tools, 33 practice questions, 3 proof templates.

| Lesson | Topic | In the textbook? |
|---|---|---|
| 1 | Statements and propositions (classifying questions, commands, opinions) | Definition only; the classification of questions, commands, exclamations and opinions is an **LabVerse extension** |
| 2 | Hypothesis and conclusion | Yes (the "if X then Y" form) |
| 3 | Forming a converse | Yes |
| 4 | Four truth combinations | Yes (Summary bullet 3, Example 4, Think and Reflect) |
| 5 | Counterexamples | Yes (Examples 1, 2; Fermat/Euler) |
| 6 | Number properties | Yes (Examples 2, 3; Exercise 5 to 16) |
| 7 | Geometric converses (equal diagonals) | Yes (Exercise 17), though the textbook asks the question without naming the counterexample |
| 8 | Baudhāyana–Pythagoras theorem and its converse | Yes (Example 5). Obtuse and acute classification by `a² + b²` versus `c²` is an **extension** |
| 9 | Evidence versus proof (Euler's `n² + n + 41`) | Fermat/Euler yes; the polynomial `n² + n + 41` is **not in the chapter** (Exercise 13 uses `n² + n + 11`) |
| 10 | Constructing arguments | Example 3 and Example 5 contain arguments; the proof-assembly activity is an extension |
| 11 | Integrated reasoning | Extension |
| 12 | Chapter practice | Exercise Set 9.1 is the textbook analogue |

## 2. Educational weaknesses and conceptual gaps

1. **No explanation of what a proposition *is* before classifying sentences.** The student is shown a definition, then asked to sort. There is no visual or concrete "test it" step. (Observed)
2. **The hub, the lessons and the tools never show the central picture of the chapter: "if P then Q" says *every* thing that satisfies P also satisfies Q.** Nothing shows the set of numbers that satisfy P inside the set that satisfies Q, so a counterexample (in P, outside Q) has no meaning beyond a rule. (Observed)
3. **Lessons are text in a 24 rem side panel with a one-sentence "experiment" instruction.** There is no worked example, no guided step-by-step reasoning, and the practice is a link to a separate bank. (Observed)
4. **The textbook's own best argument is missing:** the factor-partner argument for perfect squares and odd numbers of factors, including the lesson that an argument proving "Q implies P" does not prove "P implies Q" (Example 3). The existing chapter never discusses *which direction an argument proves*. (Observed)
5. **Equivalent wordings ("Y when X", "all A are B", "X implies Y", "only if")** are barely covered. (Observed)
6. **Necessary versus sufficient conditions** appears once, in a challenge question, with no lesson. (Observed)
7. **Proof is shown, not practised:** the proof workbench lets a student click statements into order, but the checks are weak (section 4). (Observed)
8. **"Biconditional (P ⇔ Q)" and "If and only if"** are introduced in Lesson 4 as if they were the textbook's vocabulary; the textbook says only that the statements "imply each other". Fine as an extension, but it must be labelled. (Observed)

## 3. Incorrect or misleading content

| # | Where | Problem | Evidence |
|---|---|---|---|
| 1 | `curriculumRegistry.ts`, every `ncertReference`, `practiceBank.ts` (33 questions), `experimentRegistry.ts` | "Section 1" to "Section 11", "Ganita Manjari, Section: Forming Converses" and similar are **invented**; the textbook chapter has no numbered sections. The Registry's topics 5.1/5.2 ("Limits of empirical verification", "Constructing mathematical arguments") present extension material as textbook sections. | Observed (compared with the PDF) |
| 2 | Lesson 4 text | "This is how mathematical definitions (like right triangles via Pythagoras) operate." A theorem and its converse are not a definition. Misleading. | Observed |
| 3 | Lesson 8 `whyGuide` | Attributes the proof of the converse to "Euclid constructing a second right triangle". The textbook gives this argument without naming Euclid. The claim is unsupported by the source. | Observed |
| 4 | Lesson 4 | "Original false, converse true" is illustrated with "divisible by 3 then divisible by 9". Correct, but labelled "quadrant", and a student is never told that the four cases are a classification of examples, not a law. | Observed |
| 5 | `counterexampleEngine.ts` `evaluateEqualDiagonalsConverse` | Returns **fixed numbers** (diagonals 5.0, 6.4, 4.8 and 6.2) that are not computed from any figure. The "rhombus" option falls through to a "General Quadrilateral" whose diagonals are labelled unequal, though a rhombus's diagonals are equal only for a square. The static drawing in `GeometryReasoningCanvas` is separate hand-drawn SVG. Diagram and answer do not share a source of truth. | Observed (code) |
| 6 | `proofEngine.ts` reason `r5` "Empirical Trial" has type `axiom` | The validator accepts a reason by *type*. Selecting "Empirical Trial" is accepted for any step that allows `axiom` (the "AD = AD" and "construction" steps of the isosceles proof). | Observed (code and type) |
| 7 | Lessons | `acute` / `obtuse` are shown as "Acute triangle: a² + b² > c²" without the condition "c is the longest side". True only when c is the longest. | Observed |

## 4. Mastery vulnerabilities

All **observed** by running code at the baseline.

| # | Vulnerability | Result |
|---|---|---|
| 1 | Clicking **Next Step** through the six stages (`advanceToNextStage`) then **Complete Lesson** | `completed = true`, `mastered = true` after 6 clicks, with no answer given. (P0) |
| 2 | `completeLesson` always sets `mastered: true` | Same defect from any route that completes a lesson. |
| 3 | Practice evidence (`practiceAnswers`) is **held in memory only**; a refresh erases it. | A student cannot build or keep evidence. |
| 4 | `retryPracticeQuestion` **deletes** the previous attempt | A wrong first attempt can be erased and replaced by a "first" success. |
| 5 | `submitPracticeAnswer` sets `showSolution: ... \|\| isCorrect`; hints and solution are not tied to correctness | Assistance is not recorded against the answer. |
| 6 | Proof workbench: `[s1, s1, s1, s1, s1]` (the same first step five times) is reported "**Proof Complete & Verified**" | The validator counts steps, not distinct steps. (P0 for a proof-reasoning chapter) |
| 7 | Proof workbench accepts a reason of the right *type* rather than the right reason | e.g. the distributive property accepted for the "substitution" step. |
| 8 | The old workbench has no teacher-mode guard on mastery | A teacher clicking through the stages produces "mastered". |
| 9 | The hub counts "Completed" lessons from navigation | The percentage is navigation progress. |

## 5. Missing prerequisite knowledge

Nothing in the chapter or its units states what a beginner needs. Needs, by unit:

| Unit | Needs |
|---|---|
| Chapter | What *true* and *false* mean for a checkable claim; the number words (even, odd, multiple, divisible, factor, prime, square); what a triangle's sides and angles are |
| 1 Statements | Checking a claim against an example |
| 2 Converses | The number words; seeing a condition as picking out some numbers |
| 3 Counterexamples | Same; plus the idea of "for every" versus "for one" |
| 4 Geometry | Triangle sides and angles, congruence (SSS), right angle, rectangle and its diagonals |
| 5 Proof | Using a letter for "any number" (n = 2k, n = 2k + 1) |
| 6 Synthesis | The above |

## 6. Visual and interaction opportunities

| Concept | Representation that teaches it |
|---|---|
| "If P then Q" as a claim about *every* number | A number grid coloured by P and Q, with the "P but not Q" region marked; tap a number to test it |
| Converse | The same grid with the roles of P and Q swapped |
| Four truth combinations | The grid for four statements, side by side |
| Counterexample | Tap a number to test; the readout says whether it supports, disproves or does not apply (hypothesis false) |
| Why testing is not proof | Euler's polynomial strip with 40 successes then a failure; the "first 1,000 numbers" boundary |
| Perfect squares and odd numbers of factors (textbook Example 3) | Factor-partner pairs for a chosen n, with the repeated pair highlighted |
| Equal sides and equal angles (textbook Statements 1 and 2) | A draggable triangle with live side and angle readouts |
| Equal area versus congruent (Example 4) | Two triangles on a grid with computed areas, side lengths and an SSS check |
| Baudhāyana–Pythagoras converse (Example 5) | A triangle whose angle at C is adjustable, with `a² + b²` versus `c²` live |
| Equal diagonals (Exercise 17) | Two sticks as diagonals, with length and crossing controls; the quadrilateral and its angles are computed |
| Valid versus invalid arguments | A pair of arguments compared side by side; affirming the consequent |
| Proof structure | A statement-and-reason list with the claim highlighted in a diagram, and an arrange-the-steps activity |

Purely symbolic ideas (what a proposition is; "Y when X"; necessary and sufficient) get worked examples and sorting or matching, not forced diagrams.

## 7. Accessibility and mobile issues

| Issue | Evidence |
|---|---|
| **Zero** `aria-*`, `role=` or keyboard handlers in all 11 Propositions components | Observed (grep) |
| The hub's lesson and experiment cards are `div`s with `onClick`; they cannot be reached by keyboard | Observed |
| The side panel is a fixed `w-80 / w-96` column beside the workbench | Observed; no stacked small-screen layout |
| The geometry canvas draws hand-written SVG with no text alternative | Observed |
| The hub and workbench carry `select-none` and fixed `h-screen` layouts | Observed |
| Decorative `animate-pulse` is used on the guided badge | Observed |
| `prefers-reduced-motion` is not honoured by this module | Observed |

## 8. Existing features that must be preserved

- The routes `/mathematics/propositions` and `/mathematics/propositions/workbench` and its query parameters (`lesson`, `exp`, `tab`, `mode`).
- The five workbench tools (Statement Explorer, Counterexample Lab, Number Experiment, Geometry Reasoning, Proof Workbench) and the 12 experiments.
- The practice bank (33 questions) and its filters. Its answers and mathematics were reviewed (see section 9) and are sound; its **textbook references** need correcting.
- The guided six-stage workbench flow, as the "Investigate" path, with its stage tracker.
- The existing storage key `labverse_propositions_progress_v1` and every record in it (progress is kept; unearned mastery is marked unverified).
- The existing test suite (`propositions.test.ts`).

## 9. Mathematical review of the existing engines

Checked and found correct: `numberPredicates` (including `isPrime(1)`, `getFactors`), the six canonical propositions and their authored truth values and counterexample lists (verified against brute force during EDU-1P), Euler's polynomial (`f(40) = 41²`), the Pythagoras classifier (law of cosines; triangle-inequality guard), and the three proof templates' content (the isosceles-converse proof by angle bisector and AAS is valid). Practice bank answers I read (q-prop-8, 14, 16, 18, 22, 23, 25, 29, 31) are correct.

Not correct: items 5, 6, 7 in section 3 and 6, 7 in section 4.

## 10. Implementation approach (decided from this audit)

- Reuse the EDU-1 framework. Add only what the chapter needs: an **ordering** question type (arrange proof steps) that accepts any logically valid order, a **judged** question type (the student supplies a number, a chapter judge decides if it is a counterexample), and an optional **objective** tag so mastery can require coverage of every learning objective. All backward compatible.
- Learn path for Lessons 1 to 11 (Lesson 12 stays the existing Chapter Practice). The Explore tools stay as they are.
- Mastery: `completeLesson` no longer awards it. Old practice evidence becomes persistent and per-question. Existing "mastered" flags are kept as **Unverified**.
- Fix the proof validator (distinct steps, exact reasons) and derive geometry readouts from computed figures.
- Correct textbook references to what the PDF contains.

## 11. Outcome

Implemented as described in section 10. Results, tests, limitations and remaining work: `docs/edu/EDU-1P-report.md`. Items added to this audit while implementing (found by running the code in Chrome): a hint taken before answering locked the practice question; "General Quadrilateral" drew a rectangle labelled EQUAL; mastery earned in practice mode was invisible on the hub.
