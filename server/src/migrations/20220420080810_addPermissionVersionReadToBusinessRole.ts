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
  Permission.RoadmapReadUsers |
  Permission.EditRelations;

const newBusinessRole = oldBusinessRole | Permission.VersionRead;

export async function up(knex: Knex): Promise<void> {
  Model.knex(knex);
  await Role.query()
    .where({
      type: oldBusinessRole,
    })
    .update({
      type: newBusinessRole,
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
}
