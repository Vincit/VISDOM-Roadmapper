import { Model, ModelOptions, Modifiers, Pojo, QueryContext } from 'objection';
import objectionPassword from 'objection-password';
import Token from '../tokens/tokens.model';
import { Role } from '../roles/roles.model';
import Roadmap from '../roadmaps/roadmaps.model';
import Customer from '../customer/customer.model';
import EmailVerification from '../emailVerification/emailVerification.model';

const Password = objectionPassword();
export default class User extends Password(Model) {
  id!: number;
  email!: string;
  emailVerified!: boolean;
  password!: string;
  authToken!: string | null;
  roles!: Role[];
  representativeFor!: Customer[];
  defaultRoadmapId!: number | null;

  tokens!: Token[];
  roadmaps!: Roadmap[];
  emailVerificationLink?: EmailVerification;

  static tableName = 'users';

  static jsonSchema = {
    type: 'object',
    required: ['email', 'password'],

    properties: {
      id: { type: 'integer' },
      email: { type: 'string', format: 'email', minLength: 1, maxLength: 255 },
      emailVerified: { type: 'boolean' },
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
      emailVerificationLink: {
        relation: Model.HasOneRelation,
        modelClass: EmailVerification,
        join: {
          from: 'users.id',
          to: 'emailVerification.userId',
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
     * Make sure the password, tokens, etc. are never sent when this model is sent in response body
     */
    delete json.password;
    delete json.tokens;
    delete json.authToken;
    delete json.emailVerificationLink.uuid;
    return json;
  }

  static modifiers: Modifiers = {
    findByEmail(query, email) {
      query.where((query) => {
        query.orWhereRaw('lower(email) = lower(?)', [email]);
      });
    },
  };
}
