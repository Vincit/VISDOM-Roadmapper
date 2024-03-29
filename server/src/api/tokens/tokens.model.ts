import { Model } from 'objection';
import User from './../users/users.model';

export default class Token extends Model {
  id!: number;
  provider!: string;
  instance!: string;
  type!: string;
  value!: string;

  forIntegration!: number | null;

  user!: number;
  belongsToUser?: User;

  static tableName = 'tokens';

  static jsonSchema = {
    type: 'object',
    required: ['provider', 'type', 'value'],

    properties: {
      id: { type: 'integer' },
      provider: { type: 'string', minLength: 1, maxLength: 75 },
      instance: { type: 'string', minLength: 1, maxLength: 75 },
      type: { type: 'string', minLength: 1, maxLength: 75 },
      value: { type: 'string', minLength: 1, maxLength: 250 },
      userId: { type: 'integer' },
    },
  };

  static get relationMappings() {
    return {
      belongsToUser: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'tokens.user',
          to: 'users.id',
        },
      },
    };
  }
}
