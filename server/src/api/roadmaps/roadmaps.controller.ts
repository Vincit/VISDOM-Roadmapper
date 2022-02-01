import { RouteHandlerFnc } from '../../types/customTypes';
import { RoleType } from '../../../../shared/types/customTypes';
import Roadmap from './roadmaps.model';
import User from '../users/users.model';
import { Role } from '../roles/roles.model';

export const getRoadmaps: RouteHandlerFnc = async (ctx) => {
  const { user } = ctx.state;
  if (!user) {
    throw new Error('User is required');
  }

  const query = User.relatedQuery('roadmaps').for(user.id);
  if (ctx.query.eager) {
    const result = await query.withGraphFetched(
      '[tasks.[ratings], integrations]',
    );
    (result as Roadmap[] | undefined)?.forEach((roadmap) => {
      const role = user.roles.find((role) => role.roadmapId === roadmap.id);
      if (!role) {
        throw new Error('Should only get roadmaps where the user has a role');
      }
      roadmap.tasks?.forEach((task) => {
        task.ratings = task.ratings?.filter((rating) =>
          rating.visibleFor(user, role.type),
        );
      });
    });
    ctx.body = result;
  } else {
    ctx.body = await query.withGraphFetched('[tasks(selectTaskId)]');
  }
};

export const getRoadmapsUsers: RouteHandlerFnc = async (ctx) => {
  const { user, role } = ctx.state;
  const { roadmapId } = ctx.params;
  if (!user || !role) throw new Error('User and role are required');

  const users = (await Roadmap.relatedQuery('users')
    .for(roadmapId)
    .withGraphFetched('representativeFor')
    .modifyGraph('representativeFor', (builder) => {
      builder.where('roadmapId', roadmapId).select('id');
    })) as User[] | undefined;

  ctx.body = users
    ?.filter((roadmapUser) =>
      roadmapUser.visibleFor(user, role, Number(roadmapId)),
    )
    .map(({ id, email, type }) => ({ id, email, type }));
};

export const postRoadmaps: RouteHandlerFnc = async (ctx) => {
  if (!ctx.state.user) {
    throw new Error('User is required');
  }

  ctx.body = await Roadmap.transaction(async (trx) => {
    const roadmap = await Roadmap.query(trx).insertAndFetch(ctx.request.body);
    await Role.query(trx).insert({
      userId: ctx.state.user!.id,
      roadmapId: roadmap.id,
      type: RoleType.Admin,
    });
    return roadmap;
  });
};

export const patchRoadmaps: RouteHandlerFnc = async (ctx) => {
  const {
    id,
    name,
    description,
    daysPerWorkCalibration,
    ...others
  } = ctx.request.body;
  if (Object.keys(others).length) return void (ctx.status = 400);

  const updated = await Roadmap.query().patchAndFetchById(
    ctx.params.roadmapId,
    { name: name, description: description },
  );

  if (!updated) {
    return void (ctx.status = 404);
  } else {
    return void (ctx.body = updated);
  }
};

export const deleteRoadmaps: RouteHandlerFnc = async (ctx) => {
  const numDeleted = await Roadmap.query()
    .findById(ctx.params.roadmapId)
    .delete();

  ctx.status = numDeleted == 1 ? 200 : 404;
};

export const leaveRoadmap: RouteHandlerFnc = async (ctx) => {
  if (!ctx.state.user) throw new Error('User is required');
  await Role.transaction(async (trx) => {
    const userRole = await Role.query(trx).findById([
      ctx.state.user!.id,
      Number(ctx.params.roadmapId),
    ]);

    if (!userRole) {
      return void (ctx.status = 404);
    }

    if (userRole.type === RoleType.Admin) {
      const numAdmins = await Role.query(trx)
        .where('roadmapId', ctx.params.roadmapId)
        .andWhere('type', RoleType.Admin)
        .resultSize();

      if (numAdmins === 1) {
        ctx.status = 403;
        ctx.body =
          'Cannot leave as the last admin of roadmap, delete the whole roadmap instead.';
        return;
      }
    }

    const numDeleted = await userRole.$query(trx).delete();
    ctx.status = numDeleted == 1 ? 200 : 500;
    return;
  });
};
