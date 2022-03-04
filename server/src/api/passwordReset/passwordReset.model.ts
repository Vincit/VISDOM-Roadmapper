import { Pojo } from 'objection';
import Model from '../BaseModel';
import { daysAgo } from '../../../../shared/utils/date';

export default class PasswordReset extends Model {
  userId!: number;
  uuid!: string;
  updatedAt!: string;
  valid!: boolean;

  static idColumn = 'userId';
  static tableName = 'passwordResetToken';
  static linkExpirationDays = 1;

  static jsonSchema = {
    type: 'object',
    properties: {
      userId: { type: 'integer' },
      uuid: { type: 'string', format: 'uuid' },
    },
  };

  $parseDatabaseJson(json: Pojo) {
    json = super.$parseDatabaseJson(json);
    json.updatedAt = json.updatedAt && new Date(json.updatedAt);
    json.valid = json.updatedAt >= daysAgo(PasswordReset.linkExpirationDays);
    return json;
  }
}
