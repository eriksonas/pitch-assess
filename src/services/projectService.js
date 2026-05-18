import { pb } from '../lib/pb';

const mapProject = (row, assessmentCount = 0) => ({
  id: row?.id,
  userId: row?.user,
  name: row?.name,
  description: row?.description,
  createdAt: row?.created,
  updatedAt: row?.updated,
  assessmentCount,
});

export const projectService = {
  async getAll(userId) {
    try {
      const [projects, assessments] = await Promise.all([
        pb?.collection('projects')?.getFullList({
          filter: `user = "${userId}"`,
          sort: '-created',
        }),
        pb?.collection('assessments')?.getFullList({
          filter: `user = "${userId}"`,
          fields: 'project',
        }),
      ]);

      const countByProject = (assessments || [])?.reduce((acc, a) => {
        if (a?.project) acc[a.project] = (acc[a.project] || 0) + 1;
        return acc;
      }, {});

      return (projects || [])?.map((p) => mapProject(p, countByProject?.[p?.id] || 0));
    } catch (err) {
      console.error('Error fetching projects:', err);
      throw err;
    }
  },

  async create(project) {
    try {
      if (!pb?.authStore?.isValid) throw new Error('Not authenticated');
      const userId = pb?.authStore?.record?.id;

      const data = await pb?.collection('projects')?.create({
        user: userId,
        name: project?.name,
        description: project?.description || '',
      });
      return mapProject(data);
    } catch (err) {
      console.error('Error creating project:', err);
      throw err;
    }
  },

  async update(projectId, updates) {
    try {
      const data = await pb?.collection('projects')?.update(projectId, {
        name: updates?.name,
        description: updates?.description,
      });
      return mapProject(data);
    } catch (err) {
      console.error('Error updating project:', err);
      throw err;
    }
  },

  async delete(projectId) {
    try {
      await pb?.collection('projects')?.delete(projectId);
    } catch (err) {
      console.error('Error deleting project:', err);
      throw err;
    }
  },
};

export default projectService;
