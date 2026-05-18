import { pb } from '../lib/pb';

const mapPitch = (row) => ({
  id: row?.id,
  userId: row?.user,
  assessmentId: row?.assessment || null,
  pitchContent: row?.pitch_content,
  title: row?.title,
  domain: row?.domain,
  audience: row?.audience,
  language: row?.language,
  mainIdea: row?.main_idea,
  isFavorite: !!row?.is_favorite,
  createdAt: row?.created,
  updatedAt: row?.updated,
  assessment: row?.expand?.assessment
    ? {
        id: row?.expand?.assessment?.id,
        fileName: row?.expand?.assessment?.file_name,
        overallScore: row?.expand?.assessment?.overall_score,
        status: row?.expand?.assessment?.status,
      }
    : null,
});

export const pitchService = {
  async getAll(userId) {
    try {
      const records = await pb?.collection('generated_pitches')?.getFullList({
        filter: `user = "${userId}"`,
        sort: '-created',
        expand: 'assessment',
      });
      return (records || [])?.map(mapPitch);
    } catch (err) {
      console.error('Error fetching generated pitches:', err);
      throw err;
    }
  },

  async getById(pitchId) {
    try {
      const data = await pb?.collection('generated_pitches')?.getOne(pitchId, {
        expand: 'assessment',
      });
      return mapPitch(data);
    } catch (err) {
      console.error('Error fetching generated pitch:', err);
      throw err;
    }
  },

  async create(pitch) {
    try {
      if (!pb?.authStore?.isValid) throw new Error('Not authenticated');
      const userId = pb?.authStore?.record?.id;

      const data = await pb?.collection('generated_pitches')?.create({
        user: userId,
        assessment: pitch?.assessmentId || null,
        pitch_content: pitch?.pitchContent,
        title: pitch?.title,
        domain: pitch?.domain,
        audience: pitch?.audience,
        language: pitch?.language,
        main_idea: pitch?.mainIdea,
        is_favorite: !!pitch?.isFavorite,
      });
      return mapPitch(data);
    } catch (err) {
      console.error('Error creating generated pitch:', err);
      throw err;
    }
  },

  async update(pitchId, updates) {
    try {
      const updateData = {};
      if (updates?.title !== undefined) updateData.title = updates?.title;
      if (updates?.pitchContent !== undefined) updateData.pitch_content = updates?.pitchContent;
      if (updates?.isFavorite !== undefined) updateData.is_favorite = !!updates?.isFavorite;
      if (updates?.assessmentId !== undefined)
        updateData.assessment = updates?.assessmentId || null;

      const data = await pb?.collection('generated_pitches')?.update(pitchId, updateData);
      return mapPitch(data);
    } catch (err) {
      console.error('Error updating generated pitch:', err);
      throw err;
    }
  },

  async delete(pitchId) {
    try {
      await pb?.collection('generated_pitches')?.delete(pitchId);
    } catch (err) {
      console.error('Error deleting generated pitch:', err);
      throw err;
    }
  },

  async toggleFavorite(pitchId, isFavorite) {
    return this.update(pitchId, { isFavorite });
  },
};

export default pitchService;
