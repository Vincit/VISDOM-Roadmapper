import { Model } from 'objection';

export default class EmailVerification extends Model {
  userId!: number;
  uuid!: string;
  email!: string;
  updatedAt!: string;

  static idColumn = 'userId';
  static tableName = 'emailVerification';

  static jsonSchema = {
    type: 'object',
    properties: {
      userId: { type: 'integer' },
      uuid: { type: 'string', format: 'uuid' },
      email: { type: 'string', format: 'email', maxLength: 255 },
    },
  };
}
