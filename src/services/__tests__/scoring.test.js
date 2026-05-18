import { describe, it, expect } from 'vitest';

// Pure scoring helpers live in scoring.js so tests don't drag in pdf.js / pb / axios.
import { computeWeightedScore, transformAssessmentData } from '../scoring';

// Helper to build a categoryScores payload with the same score across all
// 10 rubric categories. Useful for verifying the weighted average reduces
// to a simple average when all weights are equal.
function uniformScores(s) {
  const keys = [
    'structureClarity',
    'problemDefinition',
    'solutionDescription',
    'valueProposition',
    'marketUnderstanding',
    'technologyExplanation',
    'credibilityEvidence',
    'callToAction',
    'languageQuality',
    'audienceFit',
  ];
  return Object.fromEntries(
    keys.map((k) => [k, { score: s, justification: `${k} justification` }])
  );
}

describe('computeWeightedScore', () => {
  it('returns the score itself when every category has the same score', () => {
    expect(computeWeightedScore(uniformScores(7), 'venture-capital')).toBe(7);
    expect(computeWeightedScore(uniformScores(7), 'default')).toBe(7);
  });

  it('clamps to [0, 10]', () => {
    expect(computeWeightedScore(uniformScores(-5), 'investor')).toBe(0);
    expect(computeWeightedScore(uniformScores(15), 'investor')).toBe(10);
  });

  it('weights audience-specific categories more heavily', () => {
    // VC weights valueProposition and marketUnderstanding at 20% each.
    // If those two are 10 and everything else is 0, the score should be 4
    // (10 * 20 + 10 * 20 = 400, divided by total weight 100 = 4).
    const lopsided = uniformScores(0);
    lopsided.valueProposition.score = 10;
    lopsided.marketUnderstanding.score = 10;
    expect(computeWeightedScore(lopsided, 'venture-capital')).toBe(4);
  });

  it('produces different totals for the same scores under different audiences', () => {
    // tech-transfer weights technologyExplanation and solutionDescription
    // at 25% each. The same lopsided shape should produce a different score
    // than VC.
    const lopsided = uniformScores(0);
    lopsided.valueProposition.score = 10;
    lopsided.marketUnderstanding.score = 10;
    const vc = computeWeightedScore(lopsided, 'venture-capital');
    const tt = computeWeightedScore(lopsided, 'tech-transfer');
    expect(vc).not.toBe(tt);
  });

  it('handles missing scores gracefully (treats them as 0)', () => {
    expect(computeWeightedScore({}, 'venture-capital')).toBe(0);
    expect(computeWeightedScore(null, 'default')).toBe(0);
  });
});

describe('transformAssessmentData', () => {
  const fixture = {
    totalScore: 99, // intentionally wrong — the function should recompute
    overallFeedback: 'Strong concept overall.',
    categoryScores: uniformScores(8),
    feedback: {
      strengths: [
        { id: 1, title: 'Clear problem', description: 'd', example: 'e', impact: 'h' },
        { id: 2, title: 'Strong team', description: 'd', example: 'e', impact: 'h' },
        { id: 3, title: 'Good traction', description: 'd', example: 'e', impact: 'h' },
      ],
      improvements: [
        { id: 1, title: 'Pricing', description: 'd', suggestion: 's', example: 'e', priority: 'high' },
        { id: 2, title: 'GTM', description: 'd', suggestion: 's', example: 'e', priority: 'medium' },
        { id: 3, title: 'Moat', description: 'd', suggestion: 's', example: 'e', priority: 'low' },
      ],
      recommendations: [
        { id: 1, title: 'Run pilot', description: 'd', tags: ['t'] },
        { id: 2, title: 'Hire CTO', description: 'd', tags: ['t'] },
        { id: 3, title: 'Raise', description: 'd', tags: ['t'] },
      ],
    },
  };

  it('overrides the model-reported totalScore with the deterministic weighted score', () => {
    const result = transformAssessmentData(fixture, 'venture-capital');
    expect(result.overallScore).toBe(8); // all 8s → weighted avg 8
    expect(result.overallScore).not.toBe(99);
  });

  it('produces 10 sectionScores in the expected order', () => {
    const result = transformAssessmentData(fixture, 'default');
    expect(result.sectionScores).toHaveLength(10);
    expect(result.sectionScores[0]).toMatchObject({
      id: 1,
      name: 'Structure & Clarity',
    });
    expect(result.sectionScores[9]).toMatchObject({ id: 10, name: 'Audience Fit' });
    expect(result.sectionScores.every((s) => s.score === 8)).toBe(true);
  });

  it('passes the model strengths / improvements / recommendations through', () => {
    const result = transformAssessmentData(fixture, 'default');
    expect(result.strengths).toHaveLength(3);
    expect(result.improvements).toHaveLength(3);
    expect(result.recommendations).toHaveLength(3);
    expect(result.overallStrengths).toContain('Clear problem');
    expect(result.overallWeaknesses).toContain('Pricing');
  });
});
