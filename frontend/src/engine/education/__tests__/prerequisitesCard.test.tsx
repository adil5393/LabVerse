import { beforeEach, describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { PrerequisiteCard, PrerequisiteSet } from '../../../features/education/Prerequisites';
import { useEducationStore } from '../../../store/useEducationStore';
import { PFP_FMA, PFP_PROP, PFP_MOTION, PFP_MASS } from '../../physics/forces/learn/prerequisites';
import { FORCES_CHAPTER } from '../../physics/forces/learn/content';

describe('Compact Prerequisite Card UI', () => {
  beforeEach(() => {
    useEducationStore.setState({ readiness: {}, lessons: {} });
  });

  it('renders default collapsed state without large paragraphs or bulky buttons', () => {
    const html = renderToStaticMarkup(<PrerequisiteCard prereq={PFP_PROP} />);
    
    // Header contains concise title and readiness label
    expect(html).toContain(PFP_PROP.title);
    expect(html).toContain('data-testid="readiness-label"');
    expect(html).toContain('Not checked');
    expect(html).toContain('aria-expanded="false"');
    
    // Full why paragraph and action buttons should NOT be rendered when collapsed
    expect(html).not.toContain('Check my readiness');
    expect(html).not.toContain('Show quick refresher');
    expect(html).not.toContain('Skip this for now');
  });

  it('renders expanded state with explanation, connection, and action hierarchy when defaultOpen is true', () => {
    const html = renderToStaticMarkup(<PrerequisiteCard prereq={PFP_PROP} defaultOpen />);

    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain('acceleration is proportional to the force');
    expect(html).toContain(PFP_PROP.connection!);
    
    // Primary action
    expect(html).toContain('Check my readiness');
    
    // Visually subordinate secondary actions
    expect(html).toContain('Hide refresher');
    expect(html).toContain('Skip this for now');
  });

  it('displays distinct status styling for Ready, Needs Review, and Skipped', () => {
    // 1. Ready state (passed)
    useEducationStore.setState({
      readiness: {
        'pfp-prop': {
          status: 'passed',
          attempts: 1,
          correct: ['pfp-pr-c1', 'pfp-pr-c2'],
          missed: [],
          updatedAt: Date.now(),
        },
      },
    });
    const readyHtml = renderToStaticMarkup(<PrerequisiteCard prereq={PFP_PROP} defaultOpen />);
    expect(readyHtml).toContain('data-readiness="passed"');
    expect(readyHtml).toContain('Ready');
    expect(readyHtml).toContain('border-emerald-500');
    expect(readyHtml).toContain('Check again');
    // Skip button should not show for already passed prerequisites
    expect(readyHtml).not.toContain('Skip this for now');

    // 2. Needs review state (review suggested)
    useEducationStore.setState({
      readiness: {
        'pfp-motion': {
          status: 'needs_review',
          attempts: 1,
          correct: ['pfp-mo-c1'],
          missed: [{ questionId: 'pfp-mo-c2', refresherId: 'pfp-mo-step' }],
          updatedAt: Date.now(),
        },
      },
    });
    const reviewHtml = renderToStaticMarkup(<PrerequisiteCard prereq={PFP_MOTION} defaultOpen />);
    expect(reviewHtml).toContain('data-readiness="needs_review"');
    expect(reviewHtml).toContain('Review suggested');
    expect(reviewHtml).toContain('border-amber-500');
    expect(reviewHtml).toContain('Check the ones I missed');
    expect(reviewHtml).toContain('data-testid="readiness-recs"');

    // 3. Skipped / bypassed state
    useEducationStore.setState({
      readiness: {
        'pfp-mass': {
          status: 'bypassed',
          attempts: 0,
          correct: [],
          missed: [],
          updatedAt: Date.now(),
        },
      },
    });
    const bypassedHtml = renderToStaticMarkup(<PrerequisiteCard prereq={PFP_MASS} defaultOpen />);
    expect(bypassedHtml).toContain('data-readiness="bypassed"');
    expect(bypassedHtml).toContain('Skipped (not assessed)');
    expect(bypassedHtml).toContain('You skipped this');
  });

  it('automatically opens refresher when focusStepId matches', () => {
    const html = renderToStaticMarkup(
      <PrerequisiteCard prereq={PFP_PROP} focusStepId="pfp-pr-step" />
    );
    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain('id="refresher-pfp-pr-step"');
    expect(html).toContain('ring-amber-400');
  });

  it('renders Unit 4 prerequisite set with all reference items', () => {
    const unit4PrereqIds = ['pfp-prop', 'pfp-motion', 'pfp-mass'];
    const html = renderToStaticMarkup(
      <PrerequisiteSet
        chapter={FORCES_CHAPTER}
        ids={unit4PrereqIds}
        heading="Before Unit 4"
        intro="Ideas this unit uses. These are suggestions, not gates."
      />
    );

    expect(html).toContain('Before Unit 4');
    expect(html).toContain(PFP_PROP.title);
    expect(html).toContain(PFP_MOTION.title);
    expect(html).toContain(PFP_MASS.title);
    expect(html).toContain('data-prerequisite="pfp-prop"');
    expect(html).toContain('data-prerequisite="pfp-motion"');
    expect(html).toContain('data-prerequisite="pfp-mass"');
  });

  it('verifies refined conceptual clarity wording for PFP_FMA without altering curriculum checks', () => {
    expect(PFP_FMA.why).toContain('Newton\'s third law describes interaction pairs');
    expect(PFP_FMA.why).toContain('Newton\'s second law (a = F_net ÷ m) applies to each object separately');
    expect(PFP_FMA.refresher[0].paragraphs[0]).toContain('calculate the net horizontal force acting ON that object');
    expect(PFP_FMA.refresher[0].paragraphs[1]).toContain('Always isolate one object at a time');

    // Confirm checks and logic remain intact
    expect(PFP_FMA.checks).toHaveLength(2);
    expect(PFP_FMA.checks[0].id).toBe('pfp-fm-c1');
    expect(PFP_FMA.checks[1].id).toBe('pfp-fm-c2');
  });
});
