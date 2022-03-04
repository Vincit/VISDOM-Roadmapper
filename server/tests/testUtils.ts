import { agentData } from './setuptests';
import Roadmap from '../src/api/roadmaps/roadmaps.model';
import User from '../src/api/users/users.model';
import { Role } from '../src/api/roles/roles.model';
import { Permission } from '../../shared/types/customTypes';

export const someRoadmapId = async () =>
  (await Roadmap.query().first().throwIfNotFound()).id;

export const agentUserId = async () =>
  (await User.query().findOne({ email: agentData.email }).throwIfNotFound()).id;

export const withoutPermission = async <T>(
  roadmapId: number,
  permission: Permission,
  work: () => Promise<T>,
) => {
  const userId = await agentUserId();
  const role = await Role.query()
    .findById([userId, roadmapId])
    .throwIfNotFound();
  const original = role.type;
  await role.$query().patch({ type: original & ~permission });
  try {
    return await work();
  } finally {
    await Role.query().patchAndFetchById([userId, roadmapId], {
      type: original,
    });
  }
};
