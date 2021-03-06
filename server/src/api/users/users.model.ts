import { Model, ModelOptions, Modifiers, Pojo, QueryContext } from 'objection';
import objectionPassword from 'objection-password';
import Token from '../tokens/tokens.model';
import { Role } from '../roles/roles.model';
import Roadmap from '../roadmaps/roadmaps.model';
import Customer from '../customer/customer.model';

const Password = objectionPassword();
export default class User extends Password(Model) {
  id!: number;
  username!: string;
  email!: string;
  password!: string;
  authToken!: string | null;
  roles!: Role[];
  representativeFor!: Customer[];

  tokens!: Token[];

  static tableName = 'users';

  static jsonSchema = {
    type: 'object',
    required: ['username', 'email', 'password'],

    properties: {
      id: { type: 'integer' },
      username: {
        type: 'string',
        pattern: '^[^@]*$',
        minLength: 1,
        maxLength: 255,
      },
      email: { type: 'string', format: 'email', minLength: 1, maxLength: 255 },
      password: { type: 'string', minLength: 1, maxLength: 72 },
      authToken: { type: ['string', 'null'], format: 'uuid' },
    },
  };

  static get relationMappings() {
    return {
      tokens: {
        relation: Model.HasManyRelation,
        modelClass: Token,
        join: {
          from: 'users.id',
          to: 'tokens.user',
        },
      },
      roles: {
        relation: Model.HasManyRelation,
        modelClass: Role,
        join: {
          from: 'users.id',
          to: 'roles.userId',
        },
      },
      representativeFor: {
        relation: Model.ManyToManyRelation,
        modelClass: Customer,
        join: {
          from: 'users.id',
          through: {
            from: 'customerRepresentative.userId',
            to: 'customerRepresentative.customerId',
          },
          to: 'customer.id',
        },
      },
      roadmaps: {
        relation: Model.ManyToManyRelation,
        modelClass: Roadmap,
        join: {
          from: 'users.id',
          through: {
            from: 'roles.userId',
            to: 'roles.roadmapId',
          },
          to: 'roadmaps.id',
        },
      },
    };
  }

  async $beforeInsert(context: QueryContext): Promise<void> {
    await super.$beforeInsert(context);
  }

  async $beforeUpdate(opt: ModelOptions, context: QueryContext): Promise<void> {
    await super.$beforeUpdate(opt, context);
  }

  $formatJson(json: Pojo): Pojo {
    json = super.$formatJson(json);
    /*
     * Make sure the password, tokens are never sent when this model is sent in response body
     */
    delete json.password;
    delete json.tokens;
    delete json.authToken;
    return json;
  }

  static modifiers: Modifiers = {
    //Searches for users with any of given name filters present as a substring
    searchByUsernamePartial(query, name) {
      query.where((query) => {
        for (const namePart of name.trim().split(/\s+/)) {
          query.orWhereRaw('lower(username) like lower(?)', [
            '%' + namePart + '%',
          ]);
        }
      });
    },
    searchByUsernameExact(query, name) {
      query.where((query) => {
        query.orWhereRaw('lower(username) = lower(?)', [name]);
      });
    },
    findByEmail(query, email) {
      query.where((query) => {
        query.orWhereRaw('lower(email) = lower(?)', [email]);
      });
    },
  };
}
