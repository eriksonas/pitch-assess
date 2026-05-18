// Pure scoring & transform helpers extracted from openrouterService.js so
// they can be unit-tested without dragging in pdf.js / axios / PocketBase.

const RUBRIC_KEYS = [
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

// Per-audience weights (must sum to 100 for a single audience).
const AUDIENCE_WEIGHTS = {
  'venture-capital': {
    structureClarity: 10,
    problemDefinition: 10,
    solutionDescription: 10,
    valueProposition: 20,
    marketUnderstanding: 20,
    technologyExplanation: 5,
    credibilityEvidence: 10,
    callToAction: 10,
    languageQuality: 2.5,
    audienceFit: 2.5,
  },
  investor: {
    structureClarity: 10,
    problemDefinition: 10,
    solutionDescription: 10,
    valueProposition: 20,
    marketUnderstanding: 20,
    technologyExplanation: 5,
    credibilityEvidence: 10,
    callToAction: 10,
    languageQuality: 2.5,
    audienceFit: 2.5,
  },
  'tech-transfer': {
    structureClarity: 5,
    problemDefinition: 10,
    solutionDescription: 25,
    valueProposition: 10,
    marketUnderstanding: 10,
    technologyExplanation: 25,
    credibilityEvidence: 10,
    callToAction: 2.5,
    languageQuality: 1.25,
    audienceFit: 1.25,
  },
  customer: {
    structureClarity: 5,
    problemDefinition: 30,
    solutionDescription: 10,
    valueProposition: 30,
    marketUnderstanding: 5,
    technologyExplanation: 5,
    credibilityEvidence: 10,
    callToAction: 2.5,
    languageQuality: 1.25,
    audienceFit: 1.25,
  },
  default: {
    structureClarity: 10,
    problemDefinition: 10,
    solutionDescription: 10,
    valueProposition: 10,
    marketUnderstanding: 10,
    technologyExplanation: 10,
    credibilityEvidence: 10,
    callToAction: 10,
    languageQuality: 10,
    audienceFit: 10,
  },
};

export function getAudienceWeights(audience) {
  return AUDIENCE_WEIGHTS[audience] || AUDIENCE_WEIGHTS.default;
}

/**
 * Compute the weighted overall score from per-category scores. The model
 * is asked to produce a weighted total internally but its arithmetic is
 * unreliable; we recompute deterministically.
 *
 * @returns {number} score in [0, 10] rounded to 1 decimal
 */
export function computeWeightedScore(categoryScores, audience) {
  const weights = getAudienceWeights(audience);
  const weightSum = Object.values(weights).reduce((a, b) => a + b, 0);
  if (!weightSum) return 0;

  let total = 0;
  for (const key of Object.keys(weights)) {
    const raw = Number(categoryScores?.[key]?.score) || 0;
    total += raw * weights[key];
  }
  const weighted = total / weightSum;
  return Math.round(Math.max(0, Math.min(10, weighted)) * 10) / 10;
}

/**
 * Transform the model's JSON response into the shape the rest of the app
 * (DB writer, results page) expects.
 */
export function transformAssessmentData(data, audience) {
  const categoryScores = data?.categoryScores;

  const sectionMeta = [
    ['Structure & Clarity', 'structureClarity', 'Logical flow and presentation organization', 'Layout'],
    ['Problem Definition', 'problemDefinition', 'Clarity and relevance of problem statement', 'AlertCircle'],
    ['Solution Description', 'solutionDescription', 'Technical innovation and feasibility', 'Lightbulb'],
    ['Value Proposition', 'valueProposition', 'Unique value and benefits articulation', 'TrendingUp'],
    ['Market Understanding', 'marketUnderstanding', 'Market size and opportunity analysis', 'BarChart3'],
    ['Technology Explanation', 'technologyExplanation', 'Technical depth and accessibility', 'Cpu'],
    ['Credibility & Evidence', 'credibilityEvidence', 'Data validation and proof points', 'Shield'],
    ['Call to Action', 'callToAction', 'Clear next steps and ask', 'Target'],
    ['Language Quality', 'languageQuality', 'Communication effectiveness', 'MessageSquare'],
    ['Audience Fit', 'audienceFit', 'Alignment with target audience', 'Users'],
  ];

  const sectionScores = sectionMeta.map(([name, key], i) => ({
    id: i + 1,
    name,
    description: categoryScores?.[key]?.justification,
    score: categoryScores?.[key]?.score,
  }));

  const detailedAnalysis = sectionMeta.map(([title, key, subtitle, icon], i) => ({
    id: i + 1,
    title,
    subtitle,
    icon,
    score: categoryScores?.[key]?.score,
    analysis: categoryScores?.[key]?.justification,
    strengths: [],
    improvements: [],
    recommendations: [],
  }));

  const topStrengths = data?.feedback?.strengths
    ?.slice(0, 3)
    ?.map((s) => s?.title)
    ?.join(', ');
  const topImprovements = data?.feedback?.improvements
    ?.slice(0, 3)
    ?.map((i) => i?.title)
    ?.join(', ');

  return {
    overallScore: computeWeightedScore(categoryScores, audience),
    overallFeedback: data?.overallFeedback,
    overallStrengths: topStrengths,
    overallWeaknesses: topImprovements,
    sectionScores,
    strengths: data?.feedback?.strengths,
    improvements: data?.feedback?.improvements,
    recommendations: data?.feedback?.recommendations,
    nextSteps: [],
    detailedAnalysis,
  };
}

export { RUBRIC_KEYS };
