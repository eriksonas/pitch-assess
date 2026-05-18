import { pb } from '../lib/pb';

const mapAssessment = (row, { includeResults = true } = {}) => {
  const firstResult = row?.expand?.assessment_results_via_assessment?.[0];

  return {
    id: row?.id,
    userId: row?.user,
    projectId: row?.project || null,
    fileName: row?.file_name,
    fileUrl: row?.file ? pb?.files?.getURL(row, row?.file) : null,
    domain: row?.domain,
    audience: row?.audience,
    language: row?.language,
    status: row?.status,
    overallScore: row?.overall_score,
    createdAt: row?.created,
    updatedAt: row?.updated,
    project: row?.expand?.project
      ? { id: row?.expand?.project?.id, name: row?.expand?.project?.name }
      : null,
    results:
      includeResults && firstResult
        ? {
            id: firstResult?.id,
            assessmentId: firstResult?.assessment,
            overallFeedback: firstResult?.overall_feedback,
            overallStrengths: firstResult?.overall_strengths,
            overallWeaknesses: firstResult?.overall_weaknesses,
            // Inner JSON fields kept in snake_case to match what
            // comprehensive-results currently reads (matches DB column names).
            section_scores: firstResult?.section_scores,
            strengths: firstResult?.strengths,
            improvements: firstResult?.improvements,
            recommendations: firstResult?.recommendations,
            next_steps: firstResult?.next_steps,
            detailed_analysis: firstResult?.detailed_analysis,
            createdAt: firstResult?.created,
          }
        : null,
  };
};

export const assessmentService = {
  async getAll(userId) {
    try {
      const records = await pb?.collection('assessments')?.getFullList({
        filter: `user = "${userId}"`,
        sort: '-created',
        expand: 'project,assessment_results_via_assessment',
      });
      return (records || [])?.map((row) => mapAssessment(row));
    } catch (err) {
      console.error('Error fetching assessments:', err);
      throw err;
    }
  },

  async getById(assessmentId) {
    try {
      const data = await pb?.collection('assessments')?.getOne(assessmentId, {
        expand: 'project,assessment_results_via_assessment',
      });
      // comprehensive-results reads data.results.{section_scores,next_steps,
      // detailed_analysis} (snake_case) and data.results.id/assessment_id —
      // so return the raw result row, like the Supabase version did.
      const raw = data?.expand?.assessment_results_via_assessment?.[0] || null;
      const mapped = mapAssessment(data, { includeResults: false });
      return { ...mapped, results: raw };
    } catch (err) {
      console.error('Error fetching assessment:', err);
      throw err;
    }
  },

  async create(assessment) {
    try {
      if (!pb?.authStore?.isValid) throw new Error('Not authenticated');
      const userId = pb?.authStore?.record?.id;

      const payload = {
        user: userId,
        project: assessment?.projectId || null,
        file_name: assessment?.fileName,
        domain: assessment?.domain,
        audience: assessment?.audience,
        language: assessment?.language,
        status: 'processing',
      };

      // If a File object is provided, send multipart so the file field is populated.
      let body;
      if (assessment?.file instanceof File || assessment?.file instanceof Blob) {
        body = new FormData();
        Object.entries(payload)?.forEach(([k, v]) => {
          if (v !== null && v !== undefined) body.append(k, v);
        });
        body.append('file', assessment?.file);
      } else {
        body = payload;
      }

      const data = await pb?.collection('assessments')?.create(body);
      return mapAssessment(data);
    } catch (err) {
      console.error('Error creating assessment:', err);
      throw err;
    }
  },

  async updateWithResults(assessmentId, results) {
    try {
      await pb?.collection('assessments')?.update(assessmentId, {
        status: 'completed',
        overall_score: results?.overallScore,
      });

      const created = await pb?.collection('assessment_results')?.create({
        assessment: assessmentId,
        overall_feedback: results?.overallFeedback,
        overall_strengths: results?.overallStrengths,
        overall_weaknesses: results?.overallWeaknesses,
        section_scores: results?.sectionScores,
        strengths: results?.strengths,
        improvements: results?.improvements,
        recommendations: results?.recommendations,
        next_steps: results?.nextSteps,
        detailed_analysis: results?.detailedAnalysis,
      });
      return created;
    } catch (err) {
      console.error('Error updating assessment results:', err);
      throw err;
    }
  },

  async delete(assessmentId) {
    try {
      await pb?.collection('assessments')?.delete(assessmentId);
    } catch (err) {
      console.error('Error deleting assessment:', err);
      throw err;
    }
  },
};

export default assessmentService;
