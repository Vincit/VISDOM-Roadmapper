import { Permission } from '../../../shared/types/customTypes';
import { Knex } from 'knex';
import { Role } from '../api/roles/roles.model';
import { Model } from 'objection';

const oldBusinessRole =
  Permission.TaskRead |
  Permission.TaskCreate |
  Permission.TaskEdit |
  Permission.TaskDelete |
  Permission.TaskRate |
  Permission.TaskRatingEdit |
  Permission.TaskValueRate |
  Permission.CustomerRepresent |
  Permission.RoadmapReadUsers;

const newBusinessRole = oldBusinessRole | Permission.EditRelations;

const oldDeveloperRole =
  Permission.TaskRead |
  Permission.TaskRate |
  Permission.TaskCreate |
  Permission.TaskRatingEdit |
  Permission.TaskComplexityRate |
  Permission.VersionRead |
  Permission.RoadmapReadUsers;

const newDeveloperRole = oldDeveloperRole | Permission.EditRelations;

export async function up(knex: Knex): Promise<void> {
  Model.knex(knex);
  await Role.query()
    .where({
      type: oldBusinessRole,
    })
    .update({
      type: newBusinessRole,
    });
  await Role.query()
    .where({
      type: oldDeveloperRole,
    })
    .update({
      type: newDeveloperRole,
    });
}

export async function down(knex: Knex): Promise<void> {
  Model.knex(knex);
  await Role.query()
    .where({
      type: newBusinessRole,
    })
    .update({
      type: oldBusinessRole,
    });
  await Role.query()
    .where({
      type: newDeveloperRole,
    })
    .update({
      type: oldDeveloperRole,
    });
}
