import Model from '../BaseModel';
import User from '../users/users.model';

export default class Customer extends Model {
  id!: number;
  roadmapId!: number;
  name!: string;
  email!: string;
  weight!: number;
  color!: string;

  representatives?: User[];

  static tableName = 'customer';

  static jsonSchema = {
    type: 'object',
    required: ['name', 'color', 'email'],

    properties: {
      id: { type: 'integer' },
      name: { type: 'string', minLength: 1, maxLength: 255 },
      email: { type: 'string', format: 'email', minLength: 1, maxLength: 255 },
      weight: { type: 'number', minimum: 0, maximum: 2 },
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
