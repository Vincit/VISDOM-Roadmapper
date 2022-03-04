import { Pojo } from 'objection';
import Model from '../BaseModel';
import { daysAgo } from '../../../../shared/utils/date';

export default class EmailVerification extends Model {
  userId!: number;
  uuid!: string;
  email!: string;
  updatedAt!: string;
  valid!: boolean;

  static idColumn = 'userId';
  static tableName = 'emailVerification';
  static linkExpirationDays = 2;

  static jsonSchema = {
    type: 'object',
    properties: {
      userId: { type: 'integer' },
      uuid: { type: 'string', format: 'uuid' },
      email: { type: 'string', format: 'email', maxLength: 255 },
    },
  };

  $parseDatabaseJson(json: Pojo) {
    json = super.$parseDatabaseJson(json);
    json.updatedAt = json.updatedAt && new Date(json.updatedAt);

    json.valid =
      json.updatedAt >= daysAgo(EmailVerification.linkExpirationDays);
    return json;
  }

  $formatJson(json: Pojo): Pojo {
    json = super.$formatJson(json);
    /*
     * Make sure the uuid is not sent out in an api response.
     */
    delete json.uuid;
    return json;
  }
}
