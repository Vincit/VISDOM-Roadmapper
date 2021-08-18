import { Model } from 'objection';
import { RoleType } from '../../../../shared/types/customTypes';

export default class Invitation extends Model {
  id!: string;
  roadmapId!: number;
  type!: RoleType;
  email!: string;

  static tableName = 'invitations';

  static jsonSchema = {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      roadmapId: { type: 'integer' },
      type: { type: 'integer' },
      email: { type: 'string', format: 'email', minLength: 1, maxLength: 255 },
    },
  };
}
