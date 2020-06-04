import { Model, StringReturningMethod, Modifiers } from 'objection';
import objectionPassword from 'objection-password';

const Password = objectionPassword();
export default class User extends Password(Model) {
  id!: number;
  username!: String;
  email!: String;
  group!: String;
  password!: String;

  static tableName = 'users';

  static jsonSchema = {
    type: 'object',
    required: ['username', 'email', 'group', 'password'],

    properties: {
      id: { type: 'integer' },
      username: { type: 'string', minLength: 1, maxLength: 255 },
      email: { type: 'string', minLength: 1, maxLength: 255 },
      password: { type: 'string', minLength: 1, maxLength: 255 },
      group: { type: 'string', minLength: 1, maxLength: 255 },
    },
  };
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
