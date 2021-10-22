import { Model, Pojo } from 'objection';
import { RoleType } from '../../../../shared/types/customTypes';
import { daysAgo } from '../../utils/date';

export default class Invitation extends Model {
  id!: string;
  roadmapId!: number;
  type!: RoleType;
  email!: string;
  updatedAt!: Date;

  valid?: boolean;

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

  $beforeInsert() {
    this.updatedAt = new Date();
  }
  $beforeUpdate() {
    this.updatedAt = new Date();
  }
  $parseDatabaseJson(json: Pojo) {
    json = super.$parseDatabaseJson(json);
    json.updatedAt = json.updatedAt && new Date(json.updatedAt);

    json.valid = json.updatedAt >= daysAgo(2);
    return json;
  }
}
