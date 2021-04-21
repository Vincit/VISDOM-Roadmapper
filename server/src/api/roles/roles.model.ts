import { Model } from 'objection';
import { RoleType } from '../../types/customTypes';

export class Role extends Model {
  userId!: number;
  roadmapId!: number;
  type!: RoleType;

  static idColumn = ['userId', 'roadmapId'];
  static tableName = 'roles';

  static jsonSchema = {
    type: 'object',
    properties: {
      userId: { type: 'integer' },
      roadmapId: { type: 'integer' },
      type: { type: 'integer' },
    },
  };
}
