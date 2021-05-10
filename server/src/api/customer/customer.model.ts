import { Model } from 'objection';
import User from '../users/users.model';

export default class Customer extends Model {
  id!: number;
  name!: string;
  value!: number;
  color!: string | null;

  representatives?: User[];

  static tableName = 'customer';

  static jsonSchema = {
    type: 'object',
    required: ['name'],

    properties: {
      id: { type: 'integer' },
      name: { type: 'string', minLength: 1, maxLength: 255 },
      value: { type: 'integer', minimum: 0 },
      color: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' },
    },
  };

  static get relationMappings() {
    return {
      representatives: {
        relation: Model.ManyToManyRelation,
        modelClass: User,
        join: {
          from: 'customer.id',
          through: {
            from: 'customerRepresentative.customerId',
            to: 'customerRepresentative.userId',
          },
          to: 'users.id',
        },
      },
    };
  }
}
