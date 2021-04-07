import { Model } from 'objection';

export class Role extends Model {
  userId!: number;
  roadmapId!: number;
  type!: number;

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
