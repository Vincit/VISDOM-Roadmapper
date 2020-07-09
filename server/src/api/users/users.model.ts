import {
  Model,
  ModelOptions,
  Modifiers,
  Pojo,
  QueryContext,
  ValidationError,
} from 'objection';
import objectionPassword from 'objection-password';
import { UserType } from 'src/types/customTypes';

const Password = objectionPassword();
export default class User extends Password(Model) {
  id!: number;
  username!: string;
  email!: string;
  type!: number;
  password!: string;
  customerValue!: number;

  static tableName = 'users';

  static jsonSchema = {
    type: 'object',
    required: ['username', 'email', 'type', 'password'],

    properties: {
      id: { type: 'integer' },
      username: { type: 'string', minLength: 1, maxLength: 255 },
      email: { type: 'string', minLength: 1, maxLength: 255 },
      password: { type: 'string', minLength: 1, maxLength: 255 },
      customerValue: { type: 'integer', minimum: 0 },
      type: {
        type: 'integer',
        enum: [
          UserType.BusinessUser,
          UserType.DeveloperUser,
          UserType.CustomerUser,
          UserType.AdminUser,
        ],
      },
    },
  };

  customValidation = (context: QueryContext) => {
    if (
      this.customerValue &&
      this.type !== undefined &&
      this.type !== UserType.CustomerUser
    ) {
      throw new ValidationError({
        message:
          'Customervalue can only be assigned to users with type CustomerUser',
        type: 'CustomerValueError',
      });
    }
  };

  async $beforeInsert(context: QueryContext): Promise<void> {
    await super.$beforeInsert(context);
    this.customValidation(context);
  }

  async $beforeUpdate(opt: ModelOptions, context: QueryContext): Promise<void> {
    await super.$beforeUpdate(opt, context);
    this.customValidation(context);
  }

  $formatJson(json: Pojo): Pojo {
    json = super.$formatJson(json);
    /*
     * Make sure the password hash is never sent to the client
     * when this model is used in the response body.
     */
    delete json.password;
    return json;
  }

  static modifiers: Modifiers = {
    //Searches for users with any of given name filters present as a substring
    searchByUsernamePartial(query, name) {
      query.where((query) => {
        for (const namePart of name.trim().split(/\s+/)) {
          query.orWhereRaw('lower(username) like ?', [
            '%' + namePart.toLowerCase() + '%',
          ]);
        }
      });
    },
    searchByUsernameExact(query, name) {
      query.where((query) => {
        query.orWhereRaw('lower(username) = ?', [name.toLowerCase()]);
      });
    },
  };
}
