import axios from 'axios';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { pb } from '../lib/pb';
import {
  computeWeightedScore,
  transformAssessmentData,
  getAudienceWeights,
} from './scoring';

// Re-export so existing callers/tests that imported these from
// openrouterService keep working.
export { computeWeightedScore, transformAssessmentData };

// All upstream AI calls are routed through PocketBase proxy hooks, which
// inject the real API keys server-side. The browser never sees the keys.
const PROXY_OPENROUTER_URL = () => `${pb?.baseURL}/api/proxy/openrouter`;
const PROXY_WHISPER_URL = () => `${pb?.baseURL}/api/proxy/whisper`;

// OpenAI's audio API caps uploads at 25 MB.
const WHISPER_MAX_BYTES = 25 * 1024 * 1024;

// Point pdf.js at the bundled worker so extraction runs off the main thread.
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

// Build the auth header the proxy expects. Throws if the user is not signed in,
// so we surface that locally instead of getting a generic 401 from the server.
function pbAuthHeader() {
  if (!pb?.authStore?.isValid) {
    throw new Error('You must be signed in to run an AI analysis.');
  }
  return { Authorization: pb?.authStore?.token };
}

/**
 * OpenRouter service for AI-powered pitch analysis
 * Uses GPT-5 via OpenRouter API gateway
 */

/**
 * Analyzes a pitch deck and returns comprehensive assessment
 * @param {Object} params - Analysis parameters
 * @param {string} params.pitchContent - Extracted text content from pitch deck
 * @param {string} params.domain - Business domain (biotech, deeptech, etc.)
 * @param {string} params.audience - Target audience type
 * @param {string} params.language - Assessment language (en, pl, de, lt)
 * @param {Function} params.onProgress - Optional progress callback
 * @returns {Promise<Object>} Comprehensive assessment results
 */
export async function analyzePitch({ pitchContent, domain, audience, language, onProgress }) {
  try {
    const systemPrompt = buildSystemPrompt(domain, audience, language);
    const userPrompt = buildUserPrompt(pitchContent, domain, audience);

    if (onProgress) onProgress('Sending pitch to AI for analysis...');

    const response = await axios?.post(
      PROXY_OPENROUTER_URL(),
      {
        model: 'openai/gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'pitch_assessment',
            schema: {
              type: 'object',
              properties: {
                totalScore: { type: 'number', description: 'Weighted total score 0-10 based on audience type' },
                overallFeedback: { type: 'string', description: 'Summary feedback' },
                categoryScores: {
                  type: 'object',
                  properties: {
                    structureClarity: {
                      type: 'object',
                      properties: {
                        score: { type: 'number', description: 'Score 1-10' },
                        justification: { type: 'string', description: '1-sentence justification' }
                      },
                      required: ['score', 'justification']
                    },
                    problemDefinition: {
                      type: 'object',
                      properties: {
                        score: { type: 'number', description: 'Score 1-10' },
                        justification: { type: 'string', description: '1-sentence justification' }
                      },
                      required: ['score', 'justification']
                    },
                    solutionDescription: {
                      type: 'object',
                      properties: {
                        score: { type: 'number', description: 'Score 1-10' },
                        justification: { type: 'string', description: '1-sentence justification' }
                      },
                      required: ['score', 'justification']
                    },
                    valueProposition: {
                      type: 'object',
                      properties: {
                        score: { type: 'number', description: 'Score 1-10' },
                        justification: { type: 'string', description: '1-sentence justification' }
                      },
                      required: ['score', 'justification']
                    },
                    marketUnderstanding: {
                      type: 'object',
                      properties: {
                        score: { type: 'number', description: 'Score 1-10' },
                        justification: { type: 'string', description: '1-sentence justification' }
                      },
                      required: ['score', 'justification']
                    },
                    technologyExplanation: {
                      type: 'object',
                      properties: {
                        score: { type: 'number', description: 'Score 1-10' },
                        justification: { type: 'string', description: '1-sentence justification' }
                      },
                      required: ['score', 'justification']
                    },
                    credibilityEvidence: {
                      type: 'object',
                      properties: {
                        score: { type: 'number', description: 'Score 1-10' },
                        justification: { type: 'string', description: '1-sentence justification' }
                      },
                      required: ['score', 'justification']
                    },
                    callToAction: {
                      type: 'object',
                      properties: {
                        score: { type: 'number', description: 'Score 1-10' },
                        justification: { type: 'string', description: '1-sentence justification' }
                      },
                      required: ['score', 'justification']
                    },
                    languageQuality: {
                      type: 'object',
                      properties: {
                        score: { type: 'number', description: 'Score 1-10' },
                        justification: { type: 'string', description: '1-sentence justification' }
                      },
                      required: ['score', 'justification']
                    },
                    audienceFit: {
                      type: 'object',
                      properties: {
                        score: { type: 'number', description: 'Score 1-10' },
                        justification: { type: 'string', description: '1-sentence justification' }
                      },
                      required: ['score', 'justification']
                    }
                  },
                  required: ['structureClarity', 'problemDefinition', 'solutionDescription', 'valueProposition', 'marketUnderstanding', 'technologyExplanation', 'credibilityEvidence', 'callToAction', 'languageQuality', 'audienceFit']
                },
                feedback: {
                  type: 'object',
                  properties: {
                    strengths: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'number' },
                          title: { type: 'string' },
                          description: { type: 'string' },
                          example: { type: 'string' },
                          impact: { type: 'string' }
                        },
                        required: ['id', 'title', 'description', 'example', 'impact']
                      },
                      minItems: 3,
                      maxItems: 3
                    },
                    improvements: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'number' },
                          title: { type: 'string' },
                          description: { type: 'string' },
                          suggestion: { type: 'string' },
                          example: { type: 'string' },
                          priority: { type: 'string', enum: ['high', 'medium', 'low'] }
                        },
                        required: ['id', 'title', 'description', 'suggestion', 'example', 'priority']
                      },
                      minItems: 3,
                      maxItems: 3
                    },
                    recommendations: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'number' },
                          title: { type: 'string' },
                          description: { type: 'string' },
                          tags: { type: 'array', items: { type: 'string' } }
                        },
                        required: ['id', 'title', 'description', 'tags']
                      },
                      minItems: 3,
                      maxItems: 3
                    }
                  },
                  required: ['strengths', 'improvements', 'recommendations']
                }
              },
              required: ['totalScore', 'overallFeedback', 'categoryScores', 'feedback'],
              additionalProperties: false
            }
          }
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          ...pbAuthHeader(),
        },
        timeout: 120000
      }
    );

    if (onProgress) onProgress('Processing AI response...');

    const content = response?.data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No response content received from OpenRouter');
    }

    const assessmentData = JSON.parse(content);

    // Transform to match existing database structure. Pass `audience` so
    // we can compute the weighted total deterministically instead of
    // trusting the model's own arithmetic.
    const transformedData = transformAssessmentData(assessmentData, audience);
    return transformedData;

  } catch (error) {
    const status = error?.response?.status;
    if (status === 401) {
      throw new Error('Your session has expired. Please sign in again.');
    } else if (status === 429) {
      throw new Error('Rate limit exceeded. Please try again in a moment.');
    } else if (status === 402) {
      throw new Error('Insufficient credits. Contact an administrator.');
    } else if (status === 502 || status === 503) {
      throw new Error('AI service is not configured on the server. Contact an administrator.');
    } else if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
      throw new Error('Analysis timeout. The pitch may be too long. Please try again.');
    } else {
      console.error('Pitch analysis error:', error);
      throw new Error(error?.message || 'Failed to analyze pitch. Please try again.');
    }
  }
}

/**
 * Generate pitch content based on main idea and configuration
 * @param {Object} params - Generation parameters
 * @param {string} params.mainIdea - Main pitch idea/concept
 * @param {string} params.domain - Business domain
 * @param {string} params.audience - Target audience type
 * @param {string} params.language - Content language
 * @returns {Promise<string>} Generated pitch content
 */
export async function generatePitchContent({ mainIdea, domain, audience, language }) {
  try {
    const domainContext = {
      biotech: 'biotechnology and life sciences',
      photonics: 'photonics and optical systems',
      electronics: 'electronics and semiconductor technology',
      medtech: 'medical technology and healthcare devices',
      deeptech: 'deep-tech and advanced scientific innovation'
    };

    const audienceContext = {
      'startup-contest': 'startup competition judges who value innovation, market potential, and team capability',
      'tech-transfer': 'technology transfer offices focused on commercialization potential and IP strategy',
      'funding-agency': 'funding agencies evaluating societal impact and research excellence',
      'venture-capital': 'venture capital investors seeking scalable business models and strong returns',
      'investor': 'angel investors interested in early-stage opportunities and founder vision',
      'customer': 'potential customers evaluating practical benefits and ROI'
    };

    const languageInstructions = {
      en: 'in English',
      pl: 'in Polish (Polski)',
      de: 'in German (Deutsch)',
      lt: 'in Lithuanian (Lietuvių)'
    };

    const systemPrompt = `You are an expert pitch writer specializing in ${domainContext?.[domain] || 'technology'}. 
Your task is to create compelling, professional pitch content tailored for ${audienceContext?.[audience] || 'investors'}.
Write ${languageInstructions?.[language] || 'in English'}.

Create a comprehensive pitch that includes:
1. Problem Statement - Clear articulation of the problem
2. Solution Overview - Your innovative solution
3. Value Proposition - Unique benefits and advantages
4. Market Opportunity - Target market and size
5. Technology/Product - Technical approach or product details
6. Business Model - How you make money
7. Competitive Advantage - What sets you apart
8. Team - Key team members and expertise
9. Traction - Current progress and milestones
10. Ask - What you're seeking (funding, partnership, etc.)

Make it concise, compelling, and tailored to the audience.`;

    const userPrompt = `Generate a professional pitch based on this main idea:

"${mainIdea}"

Domain: ${domainContext?.[domain]}
Target Audience: ${audienceContext?.[audience]}

Create a complete pitch (approximately 500-800 words) that covers all essential sections and is optimized for the specified audience.`;

    const response = await axios?.post(
      PROXY_OPENROUTER_URL(),
      {
        model: 'openai/gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          ...pbAuthHeader(),
        }
      }
    );

    const generatedContent = response?.data?.choices?.[0]?.message?.content;
    
    if (!generatedContent) {
      throw new Error('No content generated from AI');
    }

    return generatedContent;
  } catch (error) {
    console.error('Error generating pitch content:', error);
    const status = error?.response?.status;
    if (status === 401) {
      throw new Error('Your session has expired. Please sign in again.');
    }
    if (status === 429) {
      throw new Error('Rate limit exceeded. Please try again in a moment.');
    }
    if (status === 502 || status === 503) {
      throw new Error('AI service is not configured on the server. Contact an administrator.');
    }
    throw new Error(error?.message || 'Failed to generate pitch content');
  }
}

/**
 * Builds system prompt based on domain, audience, and language with comprehensive rubric
 */
function buildSystemPrompt(domain, audience, language) {
  const languageInstructions = {
    en: 'Provide all feedback in English.',
    pl: 'Provide all feedback in Polish (Polski).',
    de: 'Provide all feedback in German (Deutsch).',
    lt: 'Provide all feedback in Lithuanian (Lietuvių).'
  };

  const domainContext = {
    biotech: 'biotechnology and life sciences',
    photonics: 'photonics and optical systems',
    electronics: 'electronics and semiconductor technology',
    medtech: 'medical technology and healthcare devices',
    deeptech: 'deep-tech and advanced scientific innovation'
  };

  const audienceContext = {
    'startup-contest': 'startup competition judges who evaluate innovation, feasibility, and presentation quality',
    'tech-transfer': 'technology transfer officers focused on commercialization potential and IP value',
    'funding-agency': 'government funding agencies assessing scientific merit and societal impact',
    'venture-capital': 'venture capital investors evaluating market opportunity, team, and ROI potential',
    'investor': 'angel investors looking for early-stage opportunities with strong founding teams',
    'customer': 'potential customers evaluating product-market fit and value proposition'
  };

  const audienceWeights = getAudienceWeights(audience);

  return `You are an expert Venture Capital Analyst and Pitch Coach specializing in ${domainContext?.[domain] || 'technology ventures'}. You are evaluating this pitch for ${audienceContext?.[audience] || 'investors'}.

${languageInstructions?.[language] || languageInstructions?.en}

## SCORING SCALE DEFINITION

- **1-3 (Weak):** Information is missing, contradictory, or extremely poorly articulated.
- **4-6 (Average):** Information is present but lacks depth, evidence, or clear differentiation.
- **7-8 (Strong):** Professional, well-evidenced, and compelling. Meets industry standards for a seed-stage pitch.
- **9-10 (Exceptional):** Best-in-class articulation. Clear competitive moat, high-quality data, and flawless narrative.

## EVALUATION FRAMEWORK - 10 KEY CATEGORIES

### 1. Structure & Clarity (Weight: ${audienceWeights?.structureClarity}%)
**Goal:** Evaluate the logical progression and organization of the pitch.
**Criteria:**
- Logical Flow: Does the pitch follow a standard narrative (Problem → Solution → Market → Team → Ask)?
- The 3-Minute Test: Is the core concept understandable within the first 3 slides or minutes?
- Visual/Verbal Organization: Are ideas grouped logically without overwhelming the audience?

### 2. Problem Definition (Weight: ${audienceWeights?.problemDefinition}%)
**Goal:** Assess the clarity and relevance of the problem statement.
**Criteria:**
- Pain Point Severity: Is the problem "nice to have" or a "burning platform"?
- Target Demographic: Is it clear who suffers from this problem?
- Validation: Is there evidence (data, quotes, stats) that this problem is real and widespread?

### 3. Solution Description (Weight: ${audienceWeights?.solutionDescription}%)
**Goal:** Evaluate technical innovation and feasibility.
**Criteria:**
- Direct Fit: Does the solution actually solve the problem defined?
- Innovation: Is there a "secret sauce" or a novel approach?
- Feasibility: Is the solution realistic to build and deploy within the stated timeframe?

### 4. Value Proposition (Weight: ${audienceWeights?.valueProposition}%)
**Goal:** Assess unique value and benefit articulation.
**Criteria:**
- USP: Is the "Unique Selling Proposition" clearly stated?
- Quantified Benefits: Does the solution save time (X hours), money (Y%), or increase revenue (Z%)?
- Superiority: Why is this better than the current "status quo" or manual workarounds?

### 5. Market Understanding (Weight: ${audienceWeights?.marketUnderstanding}%)
**Goal:** Evaluate market size and opportunity analysis.
**Criteria:**
- TAM/SAM/SOM: Are the market figures realistic and bottom-up (not just "1% of a $100B market")?
- Growth Trends: Is the market expanding or shrinking?
- Competitor Awareness: Does the founder acknowledge competitors and explain how they win?

### 6. Technology Explanation (Weight: ${audienceWeights?.technologyExplanation}%)
**Goal:** Assess technical depth and accessibility.
**Criteria:**
- Technical Moat: Is there mention of IP, proprietary algorithms, or data flywheels?
- Accessibility: Is the tech explained simply enough for a generalist investor but with enough depth for a technical one?
- Architecture/Stack: Brief mention of the robustness of the underlying technology.

### 7. Credibility & Evidence (Weight: ${audienceWeights?.credibilityEvidence}%)
**Goal:** Assess data validation and proof points.
**Criteria:**
- Traction: Revenue, users, LOIs (Letters of Intent), or pilot results.
- Team Expertise: Why is this team uniquely qualified to solve this problem?
- Social Proof: Partnerships, awards, or reputable advisor involvement.

### 8. Call to Action (Weight: ${audienceWeights?.callToAction}%)
**Goal:** Evaluate the clarity of next steps and the "Ask".
**Criteria:**
- The Ask: Is the funding amount or partnership goal specific?
- Use of Funds: Is there a clear breakdown of where the money goes (e.g., 40% R&D, 30% Marketing)?
- Milestones: What will the "Ask" help the company achieve in the next 12-18 months?

### 9. Language Quality (Weight: ${audienceWeights?.languageQuality}%)
**Goal:** Assess communication effectiveness.
**Criteria:**
- Tone: Is it professional yet enthusiastic?
- Brevity: Is the language concise, avoiding unnecessary "fluff" or jargon?
- Grammar/Style: Is the presentation polished and free of errors?

### 10. Audience Fit (Weight: ${audienceWeights?.audienceFit}%)
**Goal:** Assess alignment with the target audience.
**Criteria:**
- Tailoring: Does the pitch emphasize what the specific audience cares about (e.g., ROI for VCs, Integration for Partners)?
- Contextual Relevance: Use of domain-specific terminology that resonates with the audience.

## OUTPUT REQUIREMENTS

1. **Score each category (1-10)** with a 1-sentence justification
2. **Calculate weighted total score** based on audience-specific weights above
3. **Identify Top 3 Strengths** with specific examples from the pitch
4. **Identify Top 3 Improvement Areas** with actionable recommendations
5. **Provide 3 Actionable Recommendations** with concrete next steps

Be specific, reference actual content from the pitch, and provide constructive, actionable insights.`;
}

/**
 * Builds user prompt with pitch content
 */
function buildUserPrompt(pitchContent, domain, audience) {
  return `Please analyze this pitch deck for a ${domain} venture targeting ${audience}.

PITCH CONTENT:
${pitchContent}

Provide a comprehensive assessment following the 10-category rubric with:
- Individual scores (1-10) for each category with 1-sentence justifications
- Weighted total score based on audience type
- Top 3 Strengths with specific examples from the pitch
- Top 3 Improvement Areas with actionable suggestions and concrete examples
- 3 Strategic Recommendations with implementation tags

Be specific, reference actual content from the pitch, and provide actionable insights.`;
}

/**
 * Extracts plain text from each page of a PDF File and joins them with
 * page markers so the model can reason about slide ordering.
 */
async function extractPdfText(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = (content?.items || [])
      .map((item) => item?.str || '')
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    pages.push(`--- Slide ${i} ---\n${text}`);
  }

  return pages.join('\n\n');
}

/**
 * Transcribe an audio or video file via OpenAI Whisper.
 *
 * Notes / limits:
 * - 25 MB request cap. Larger files must be re-encoded or chunked client-side
 *   (not implemented here — surfaced as an error so the user knows).
 * - The `language` hint (ISO-639-1) improves accuracy when the spoken
 *   language is known. Pass undefined to let Whisper auto-detect.
 */
async function transcribeMedia(file, language) {
  if (file.size > WHISPER_MAX_BYTES) {
    const mb = (file.size / 1024 / 1024).toFixed(1);
    throw new Error(
      `File is ${mb} MB; the transcription API caps uploads at 25 MB. ` +
        `Please compress the recording (e.g. export as 64 kbps mono mp3) and try again.`
    );
  }

  const form = new FormData();
  form.append('file', file);
  if (language) form.append('language', language);

  const resp = await fetch(PROXY_WHISPER_URL(), {
    method: 'POST',
    headers: { ...pbAuthHeader() },
    body: form,
  });

  if (!resp.ok) {
    let detail = '';
    try {
      detail = (await resp.text()).slice(0, 300);
    } catch (_) {}
    if (resp.status === 401) {
      throw new Error('Your session has expired. Please sign in again.');
    }
    if (resp.status === 413) {
      throw new Error('Recording is too large for the transcription service.');
    }
    if (resp.status === 502 || resp.status === 503) {
      throw new Error('Transcription service is not configured on the server. Contact an administrator.');
    }
    throw new Error(`Transcription failed (${resp.status}): ${detail}`);
  }

  // The proxy forwards the upstream response body, which for
  // response_format=text is a plain string.
  const text = (await resp.text()).trim();
  if (text.length < 50) {
    throw new Error(
      'Transcription produced very little text — the recording may be silent or in an unsupported language.'
    );
  }
  return text;
}

/**
 * Extract pitch text from an uploaded file.
 *  - PDFs: parsed in-browser via pdf.js
 *  - Audio/video: transcribed server-side via OpenAI Whisper (25 MB cap)
 *  - Anything else: thrown
 *
 * @param {File} file - File picked in FileUploadZone
 * @param {Object} [opts]
 * @param {string} [opts.language] - ISO-639-1 hint for Whisper (en/pl/de/lt)
 * @returns {Promise<string>} Extracted text content
 */
export async function extractPitchContent(file, opts = {}) {
  if (!file) throw new Error('No file provided for extraction.');

  const name = (file.name || '').toLowerCase();
  const isPdf = file.type === 'application/pdf' || name.endsWith('.pdf');

  if (isPdf) {
    try {
      const text = await extractPdfText(file);
      if (!text || text.replace(/[\s-]+/g, '').length < 50) {
        throw new Error(
          'This PDF appears to contain no extractable text (image-only or scanned). ' +
            'OCR is not yet supported — please upload a text-based PDF.'
        );
      }
      return text;
    } catch (err) {
      throw new Error(`Could not read PDF: ${err?.message || err}`);
    }
  }

  const isAudioVideo =
    /^(audio|video)\//.test(file.type || '') ||
    /\.(mp3|wav|m4a|mp4)$/i.test(name);
  if (isAudioVideo) {
    return transcribeMedia(file, opts?.language);
  }

  throw new Error(
    `Unsupported file type: ${file.type || file.name}. Upload a PDF pitch deck or audio recording.`
  );
}

export default {
  analyzePitch,
  extractPitchContent,
  generatePitchContent,
};